const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.database();

function brazilDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(date);
}

// Bônus de cadastro: concedido uma única vez no evento de criação do Auth.
exports.grantSignupBonus = functions.auth.user().onCreate(async (user) => {
  const walletRef = db.ref(`wallets/${user.uid}`);
  const result = await walletRef.transaction((current) => {
    const wallet = current || {};
    if (wallet.signupBonusGranted) return;
    return {
      ...wallet,
      withdrawableBalance: Number(((Number(wallet.withdrawableBalance) || 0) + 3.50).toFixed(2)),
      signupBonusGranted: true,
      signupBonusGrantedAt: Date.now(),
      checkinCount: Number(wallet.checkinCount) || 0,
      lastCheckinDate: wallet.lastCheckinDate || null
    };
  });
  if (result.committed) {
    await db.ref(`transactions/${user.uid}`).push({
      type: 'signup_bonus', amount: 3.50, description: 'Bônus de cadastro', createdAt: admin.database.ServerValue.TIMESTAMP
    });
  }
});

// O dia é calculado no servidor em horário de Brasília; transação evita resgates simultâneos duplicados.
exports.claimDailyCheckin = functions.https.onCall(async (_data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Faça login para realizar o check-in.');
  const uid = context.auth.uid;
  const dateKey = brazilDateKey();
  const walletRef = db.ref(`wallets/${uid}`);
  let alreadyClaimed = false;
  const result = await walletRef.transaction((current) => {
    const wallet = current || {};
    if (wallet.lastCheckinDate === dateKey) {
      alreadyClaimed = true;
      return;
    }
    return {
      ...wallet,
      withdrawableBalance: Number(((Number(wallet.withdrawableBalance) || 0) + 1.00).toFixed(2)),
      lastCheckinDate: dateKey,
      checkinCount: (Number(wallet.checkinCount) || 0) + 1
    };
  });
  if (!result.committed) {
    const wallet = result.snapshot.val() || {};
    return { alreadyClaimed: alreadyClaimed || wallet.lastCheckinDate === dateKey, wallet };
  }
  await db.ref(`transactions/${uid}`).push({
    type: 'daily_checkin', amount: 1.00, description: 'Check-in diário', date: dateKey,
    createdAt: admin.database.ServerValue.TIMESTAMP
  });
  return { alreadyClaimed: false, wallet: result.snapshot.val() };
});
