const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');

initializeApp({ databaseURL: 'https://nexus-acoes-default-rtdb.firebaseio.com' });

const BRAZIL_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const PLANS = {
  'nexus-start': { name: 'NEXUS START', price: 35, dailyReturn: 4.50, days: 23, limit: 1 },
  'nexus-tech': { name: 'NEXUS TECH', price: 100, dailyReturn: 17.50, days: 17, limit: 1 },
  'nexus-agro': { name: 'NEXUS AGRO', price: 200, dailyReturn: 38.50, days: 16, limit: 3 },
  'nexus-industrial': { name: 'NEXUS INDUSTRIAL', price: 300, dailyReturn: 60.50, days: 15, limit: 2 },
  'nexus-energy': { name: 'NEXUS ENERGY', price: 600, dailyReturn: 127.50, days: 9, limit: 1 },
  'nexus-crypto': { name: 'NEXUS CRYPTO', price: 1000, dailyReturn: 212.75, days: 9, limit: 2 },
  'nexus-global': { name: 'NEXUS GLOBAL', price: 2500, dailyReturn: 453.28, days: 11, limit: 2 },
  'nexus-prime': { name: 'NEXUS PRIME', price: 5000, dailyReturn: 817.36, days: 12, limit: 2 }
};

function brazilDayStart(timestamp) {
  const local = new Date(timestamp - BRAZIL_OFFSET_MS);
  return Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) + BRAZIL_OFFSET_MS;
}

exports.activateInvestment = onCall({ region: 'southamerica-east1' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Entre na sua conta para ativar um plano.');

  const uid = request.auth.uid;
  const planId = String(request.data?.planId || '');
  const activationKey = String(request.data?.activationKey || '');
  const plan = PLANS[planId];

  if (!plan) throw new HttpsError('invalid-argument', 'Plano inválido.');
  if (!/^[A-Za-z0-9_-]{12,80}$/.test(activationKey)) {
    throw new HttpsError('invalid-argument', 'Identificador de ativação inválido.');
  }

  const walletRef = getDatabase().ref('wallets/' + uid);
  const now = Date.now();
  const firstCreditAt = brazilDayStart(now) + DAY_MS;
  const investment = {
    instanceId: 'INV-' + activationKey,
    activationKey,
    planId,
    name: plan.name,
    price: plan.price,
    dailyReturn: plan.dailyReturn,
    days: plan.days,
    startAt: now,
    firstCreditAt,
    endAt: firstCreditAt + plan.days * DAY_MS,
    status: 'active',
    daysCredited: 0,
    paidTotal: 0,
    projectedTotal: Number((plan.dailyReturn * plan.days).toFixed(2)),
    timezone: 'America/Sao_Paulo'
  };

  const result = await walletRef.transaction((current) => {
    const wallet = current || {};
    const activations = wallet.investmentActivations || {};
    const investments = wallet.investments || {};

    // Repetir a mesma chamada após falha de rede não debita novamente.
    if (activations[activationKey]) return wallet;

    const purchased = Object.values(investments).filter((item) => item?.planId === planId).length;
    if (purchased >= plan.limit) return;
    const balance = Number(wallet.depositBalance || 0);
    if (!Number.isFinite(balance) || balance < plan.price) return;

    return {
      ...wallet,
      depositBalance: Number((balance - plan.price).toFixed(2)),
      investments: { ...investments, [investment.instanceId]: investment },
      investmentActivations: { ...activations, [activationKey]: investment.instanceId }
    };
  }, undefined, false);

  const savedWallet = result.snapshot.val() || {};
  const savedId = savedWallet.investmentActivations?.[activationKey];
  if (savedId && savedWallet.investments?.[savedId]) {
    return { success: true, investment: savedWallet.investments[savedId], repeated: savedWallet.investments[savedId].startAt !== now };
  }

  if (!result.committed) {
    const purchased = Object.values(savedWallet.investments || {}).filter((item) => item?.planId === planId).length;
    if (purchased >= plan.limit) throw new HttpsError('failed-precondition', 'Você já atingiu o limite deste plano.');
    throw new HttpsError('failed-precondition', 'Saldo de depósito insuficiente.');
  }

  throw new HttpsError('internal', 'A ativação não foi salva corretamente. Confira sua carteira antes de tentar novamente.');
});

exports.requestWithdrawal = onCall({ region: 'southamerica-east1' }, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Entre na sua conta para solicitar um saque.');
  const uid = request.auth.uid;
  const amount = Number(Number(request.data?.amount || 0).toFixed(2));
  const requestId = String(request.data?.requestId || '');
  const cpf = String(request.data?.cpf || '').replace(/\\D/g, '');
  const holderName = String(request.data?.holderName || '').trim().slice(0, 120);
  const pixKeyType = String(request.data?.pixKeyType || '');
  const pixKey = String(request.data?.pixKey || '').trim().slice(0, 200);

  if (!/^[A-Za-z0-9_-]{16,90}$/.test(requestId)) throw new HttpsError('invalid-argument', 'Identificador do saque inválido.');
  if (!Number.isFinite(amount) || amount < 10 || amount > 100000) throw new HttpsError('invalid-argument', 'O saque mínimo é R$ 10,00 e o máximo é R$ 100.000,00.');
  if (cpf.length !== 11) throw new HttpsError('invalid-argument', 'Informe o CPF do titular com 11 números.');
  if (holderName.length < 3) throw new HttpsError('invalid-argument', 'Informe o nome completo do titular.');
  if (!['CPF', 'E-mail', 'Telefone'].includes(pixKeyType) || !pixKey) throw new HttpsError('invalid-argument', 'Informe uma chave PIX válida.');
  if (pixKeyType === 'CPF' && pixKey.replace(/\\D/g, '').length !== 11) throw new HttpsError('invalid-argument', 'A chave PIX CPF deve conter 11 números.');
  if (pixKeyType === 'E-mail' && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(pixKey)) throw new HttpsError('invalid-argument', 'Informe um e-mail válido.');
  if (pixKeyType === 'Telefone' && !/^\\+?[0-9()\\s-]{10,20}$/.test(pixKey)) throw new HttpsError('invalid-argument', 'Informe um telefone válido.');

  const walletRef = getDatabase().ref('wallets/' + uid);
  const now = Date.now();
  const feeAmount = Number((amount * 0.05).toFixed(2));
  const netAmount = Number((amount - feeAmount).toFixed(2));
  const result = await walletRef.transaction((current) => {
    const wallet = current || {};
    const reservations = wallet.withdrawalReservations || {};
    if (reservations[requestId]) return wallet;
    const active = Object.values(wallet.investments || {}).some((item) => item && now < Number(item.firstCreditAt || 0) + Number(item.days || 0) * DAY_MS);
    if (!active || Number(wallet.withdrawableBalance || 0) < amount) return;
    const record = {
      id: requestId, uid, email: request.auth.token.email || '', name: holderName,
      amount, feeAmount, netAmount, cpf, holderName, pixKeyType, pixKey,
      status: 'pending', createdAt: now
    };
    return {
      ...wallet,
      withdrawableBalance: Number((Number(wallet.withdrawableBalance || 0) - amount).toFixed(2)),
      withdrawalReservations: { ...reservations, [requestId]: record }
    };
  }, undefined, false);

  const savedWallet = result.snapshot.val() || {};
  const reserved = savedWallet.withdrawalReservations?.[requestId];
  if (!reserved) {
    const active = Object.values(savedWallet.investments || {}).some((item) => item && now < Number(item.firstCreditAt || 0) + Number(item.days || 0) * DAY_MS);
    if (!active) throw new HttpsError('failed-precondition', 'É necessário ter um plano ativo para solicitar saque.');
    throw new HttpsError('failed-precondition', 'Saldo sacável insuficiente.');
  }

  const requestRef = getDatabase().ref('withdrawalRequests/' + requestId);
  const requestResult = await requestRef.transaction((current) => current || reserved, undefined, false);
  const savedRequest = requestResult.snapshot.val();
  if (savedRequest?.uid !== uid) throw new HttpsError('already-exists', 'Não foi possível registrar o pedido. Gere uma nova solicitação.');
  await getDatabase().ref('withdrawalRequestsByUser/' + uid + '/' + requestId).set(savedRequest);
  return { success: true, request: savedRequest, repeated: !result.committed };
});
