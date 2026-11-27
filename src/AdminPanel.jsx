import React, { useEffect, useMemo, useState } from 'react';
import { onValue, push, ref, runTransaction, set, update } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { auth, database } from './firebase';
import {
  LayoutDashboard, Users, Wallet, ArrowDownToLine, ArrowUpFromLine, Gift,
  BarChart3, Settings, Search, RefreshCw, LogOut, ExternalLink, ShieldCheck,
  Copy, CheckCircle2, XCircle, Clock3, Menu, X, CircleDollarSign, Activity,
  UserRound, ClipboardList, QrCode, AlertCircle, Headset, Send, MessageCircle, MousePointerClick
} from 'lucide-react';

const ADMIN_EMAIL = 'vixtormateus15@gmail.com';
const money = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const date = (v) => v ? new Date(Number(v)).toLocaleString('pt-BR') : '—';
const statusLabel = (s) => ({ pending:'Pendente', awaiting_payment:'PIX enviado · cliente pode pagar', paid:'Pago', approved:'Aprovado', rejected:'Recusado', cancelled:'Cancelado' }[s] || s || 'Pendente');
const statusClass = (s) => s === 'paid' || s === 'approved' ? 'text-emerald-300 bg-emerald-400/10' : s === 'rejected' || s === 'cancelled' ? 'text-rose-300 bg-rose-400/10' : 'text-amber-200 bg-amber-400/10';

const NAV = [
  ['overview','Visão geral',LayoutDashboard],
  ['accesses','Acessos ao site',MousePointerClick],
  ['deposits','Depósitos',ArrowDownToLine],
  ['withdrawals','Saques',ArrowUpFromLine],
  ['investment-requests','Ativações de planos',Activity],
  ['users','Clientes',Users],
  ['support','Suporte',Headset],
  ['wallets','Carteiras',Wallet],
  ['bonuses','Bônus e check-ins',Gift],
  ['yields','Rendimentos',CircleDollarSign],
  ['reports','Relatórios',BarChart3],
  ['settings','Configurações',Settings]
];

export default function AdminPanel({ firebaseUser }) {
  const [section,setSection] = useState('overview');
  const [mobileNav,setMobileNav] = useState(false);
  const [deposits,setDeposits] = useState([]);
  const [withdrawals,setWithdrawals] = useState([]);
  const [investmentRequests,setInvestmentRequests] = useState([]);
  const [profiles,setProfiles] = useState([]);
  const [wallets,setWallets] = useState([]);
  const [loading,setLoading] = useState(true);
  const [search,setSearch] = useState('');
  const [filter,setFilter] = useState('all');
  const [selected,setSelected] = useState(null);
  const [selectedClientUid,setSelectedClientUid] = useState('');
  const [pixCode,setPixCode] = useState('');
  const [txId,setTxId] = useState('');
  const [note,setNote] = useState('');
  const [busy,setBusy] = useState(false);
  const [notice,setNotice] = useState('');
  const [yieldUid,setYieldUid] = useState('');
  const [yieldAmount,setYieldAmount] = useState('');
  const [yieldReference,setYieldReference] = useState('');
  const [yieldDescription,setYieldDescription] = useState('Rendimento confirmado');
  const [yieldInvestmentId,setYieldInvestmentId] = useState('');
  const [yieldBusy,setYieldBusy] = useState(false);
  const [siteAccessEvents,setSiteAccessEvents] = useState([]);
  const [accessAuthInfo,setAccessAuthInfo] = useState({tokenEmail:'Verificando...',projectId:database?.app?.options?.projectId || 'desconhecido',databaseURL:database?.app?.options?.databaseURL || 'não identificada'});
  const [supportThreads,setSupportThreads] = useState([]);
  const [selectedSupportUid,setSelectedSupportUid] = useState('');
  const [supportMessages,setSupportMessages] = useState([]);
  const [supportReply,setSupportReply] = useState('');
  const [supportBusy,setSupportBusy] = useState(false);
  const isAdmin = String(firebaseUser?.email || '').toLowerCase() === ADMIN_EMAIL;

  useEffect(() => {
    if (!isAdmin || !database || !firebaseUser) { setLoading(false); return undefined; }
    let cancelled = false;
    const stops = [];

    const startSubscriptions = async () => {
      let tokenEmail = '(não disponível)';
      try {
        // Atualiza o token antes dos listeners para evitar reivindicação de e-mail antiga.
        const tokenResult = await firebaseUser.getIdTokenResult(true);
        tokenEmail = String(tokenResult?.claims?.email || '(claim email ausente)');
      } catch (error) {
        tokenEmail = 'Falha ao atualizar token: ' + (error?.code || error?.message || 'erro desconhecido');
      }
      if (cancelled) return;

      const projectId = database.app?.options?.projectId || 'desconhecido';
      const databaseURL = database.app?.options?.databaseURL || 'não identificada';
      setAccessAuthInfo({ tokenEmail, projectId, databaseURL });

      const subscribe = (path, setter) => stops.push(onValue(ref(database,path),(snap) => {
        const raw=snap.val() || {};
        setter(Object.entries(raw).map(([id,value]) => ({id,...(value || {})})).sort((a,b)=>Number(b.createdAt || 0)-Number(a.createdAt || 0)));
        if (['depositRequests', 'withdrawalRequests', 'investmentRequests'].includes(path)) {
          const mirrorUpdates = {};
          Object.entries(raw).forEach(([id, request]) => {
            if (request?.uid) {
              const mirrorPath = path === 'depositRequests' ? 'depositRequestsByUser/' : path === 'withdrawalRequests' ? 'withdrawalRequestsByUser/' : 'investmentRequestsByUser/';
              mirrorUpdates[mirrorPath + request.uid + '/' + id] = request;
            }
          });
          if (Object.keys(mirrorUpdates).length) update(ref(database), mirrorUpdates).catch((error) => console.error('Falha ao sincronizar pedidos do cliente:', error));
        }
        setLoading(false);
      },() => { setNotice('Falha ao ler '+path+'. Verifique as regras do Realtime Database.'); setLoading(false); }));

      subscribe('depositRequests',setDeposits);
      subscribe('withdrawalRequests',setWithdrawals);
      subscribe('investmentRequests',setInvestmentRequests);
      stops.push(onValue(ref(database,'supportChats'),snap=>{
        const raw=snap.val()||{};
        const rows=Object.entries(raw).map(([uid,thread])=>({uid,profile:thread?.profile||{},messages:Object.entries(thread?.messages||{}).map(([id,msg])=>({id,...(msg||{})})).sort((a,b)=>Number(a.createdAt||0)-Number(b.createdAt||0))}));
        rows.sort((a,b)=>Number(b.messages.at(-1)?.createdAt||b.profile.createdAt||0)-Number(a.messages.at(-1)?.createdAt||a.profile.createdAt||0));
        setSupportThreads(rows);
      },()=>setNotice('Falha ao carregar as conversas do suporte. Confira as regras do Firebase.')));
      subscribe('profiles',setProfiles);
      subscribe('wallets',setWallets);
      stops.push(onValue(ref(database,'siteAccessEvents'),snap=>{
        const raw=snap.val()||{};
        setSiteAccessEvents(Object.entries(raw).map(([id,value])=>({id,...(value||{})})).sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0)));
      },(error)=>{
        console.error('NEXUS: falha ao ler siteAccessEvents:',error);
        setNotice('Falha ao carregar acessos ('+(error?.code || error?.message || 'erro desconhecido')+'). Conta do painel: '+(firebaseUser.email || '(sem e-mail)')+'. E-mail no token: '+tokenEmail+'. Projeto: '+projectId+'. Banco: '+databaseURL+'. Confira se as regras publicadas no Firebase permitem a leitura para este e-mail.');
      }));
    };

    startSubscriptions();
    return () => { cancelled = true; stops.forEach(stop => stop()); };
  },[isAdmin,firebaseUser?.uid]);

  useEffect(()=>{
    if(!isAdmin || !database || !selectedSupportUid){setSupportMessages([]);return undefined;}
    return onValue(ref(database,'supportChats/'+selectedSupportUid+'/messages'),snap=>{
      const raw=snap.val()||{};
      setSupportMessages(Object.entries(raw).map(([id,msg])=>({id,...(msg||{})})).sort((a,b)=>Number(a.createdAt||0)-Number(b.createdAt||0)));
    },()=>setNotice('Não foi possível abrir as mensagens desta conversa.'));
  },[isAdmin,selectedSupportUid]);

  const sendSupportReply=async(event)=>{
    event.preventDefault();
    const message=supportReply.trim();
    if(!message||!selectedSupportUid||supportBusy)return;
    setSupportBusy(true);
    try{
      const messageRef=push(ref(database,'supportChats/'+selectedSupportUid+'/messages'));
      await set(messageRef,{senderUid:firebaseUser.uid,senderRole:'admin',senderName:'Suporte NEXUS',text:message,createdAt:Date.now()});
      setSupportReply('');
    }catch(error){setNotice('Não foi possível enviar a resposta: '+(error?.message||'erro desconhecido'));}
    finally{setSupportBusy(false);}
  };

  // Pedidos de depósito recusados antigos também ficam ocultos da fila.
  const visibleDeposits = deposits.filter((item) => item.status !== 'rejected');
  const all = section === 'deposits' ? visibleDeposits : withdrawals;
  const filtered = useMemo(() => all.filter((item) => {
    const statusOk=filter==='all' || item.status===filter;
    const hay=[item.id,item.uid,item.email,item.name,item.pixKey,item.amount].join(' ').toLowerCase();
    return statusOk && hay.includes(search.toLowerCase());
  }),[all,filter,search]);
  const pendingDeposits=visibleDeposits.filter(x=>x.status==='pending' || x.status==='awaiting_payment');
  const pendingWithdrawals=withdrawals.filter(x=>x.status==='pending');
  const pendingInvestmentRequests=investmentRequests.filter(x=>x.status==='pending');
  const depositTotal=visibleDeposits.filter(x=>x.status==='paid').reduce((n,x)=>n+Number(x.amount||0),0);
  const paidWithdrawals=withdrawals.filter(x=>x.status==='paid').reduce((n,x)=>n+Number(x.amount||0),0);
  const selectedTitle=selected ? (selected.name || selected.email || selected.uid || selected.id) : '';
  const clientRows = useMemo(() => {
    const ids = new Set([...profiles.map(x => x.id), ...wallets.map(x => x.id)]);
    return [...ids].map(uid => {
      const profile = profiles.find(x => x.id === uid) || {};
      const wallet = wallets.find(x => x.id === uid) || {};
      return { uid, profile, wallet, name: profile.displayName || profile.name || 'Cliente', email: profile.email || '' };
    }).filter(x => [x.uid,x.email,x.name].join(' ').toLowerCase().includes(search.toLowerCase()))
      .sort((a,b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [profiles,wallets,search]);
  const selectedClient = clientRows.find(x => x.uid === selectedClientUid) || null;
  const investmentRows = wallets.flatMap((wallet) => Object.values(wallet.investments || {}).map((investment) => ({ ...investment, uid: wallet.id, wallet }))).sort((a,b)=>Number(b.startAt||0)-Number(a.startAt||0));

  const openRequest=(item,type) => {
    setSelected({...item,_type:type});
    setPixCode(item.pixCopyPaste || item.pixCode || '');
    setTxId(item.transactionId || '');
    setNote(item.adminNote || '');
    setNotice('');
  };
  const creditManualYield = async (event) => {
    event.preventDefault();
    if (yieldBusy) return;
    const uid = yieldUid.trim();
    const amount = Number(String(yieldAmount).replace(',', '.'));
    const reference = yieldReference.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    if (!uid || uid.length < 10) { setNotice('Informe o UID completo do cliente.'); return; }
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) { setNotice('Informe um valor válido maior que zero.'); return; }
    if (!reference || reference.length < 5 || reference.length > 100) { setNotice('Informe uma referência única com pelo menos 5 caracteres.'); return; }
    setYieldBusy(true); setNotice('');
    const creditedAt = Date.now();
    let duplicateDetected = false;
    try {
      const walletRef = ref(database, 'wallets/' + uid);
      const result = await runTransaction(walletRef, (current) => {
        const wallet = current || {};
        const credits = wallet.yieldCredits || {};
        if (credits[reference]) { duplicateDetected = true; return; }
        const investments = wallet.investments || {};
        if (yieldInvestmentId && !investments[yieldInvestmentId]) return;
        const updatedInvestments = { ...investments };
        if (yieldInvestmentId) {
          const investment = updatedInvestments[yieldInvestmentId];
          updatedInvestments[yieldInvestmentId] = { ...investment, paidTotal: Number((Number(investment.paidTotal || 0) + amount).toFixed(2)), daysCredited: Math.min(Number(investment.days || 0), Number(investment.daysCredited || 0) + 1), lastManualCreditAt: creditedAt };
        }
        return { ...wallet, withdrawableBalance: Number((Number(wallet.withdrawableBalance || 0) + amount).toFixed(2)), investments: updatedInvestments, yieldCredits: { ...credits, [reference]: { amount: Number(amount.toFixed(2)), description: yieldDescription.trim() || 'Rendimento confirmado', reference, investmentId: yieldInvestmentId || null, creditedAt, creditedBy: firebaseUser.uid } } };
      }, { applyLocally: false });
      if (duplicateDetected) throw new Error('Esta referência já foi utilizada. O crédito não foi repetido.');
      if (!result.snapshot.child('yieldCredits').child(reference).exists()) throw new Error('Não foi possível confirmar o crédito ou o investimento selecionado não existe.');
      setNotice('Crédito registrado e adicionado ao saldo sacável do cliente.');
      setYieldAmount(''); setYieldReference(''); setYieldDescription('Rendimento confirmado'); setYieldInvestmentId('');
    } catch (error) { setNotice('Não foi possível registrar o rendimento: ' + (error?.message || 'erro desconhecido')); }
    finally { setYieldBusy(false); }
  };

  const approveInvestmentRequest = async (item, status) => {
    if (!item || busy) return;
    setBusy(true); setNotice('');
    try {
      const path = 'investmentRequests/' + item.id;
      let investmentId = item.investmentId || '';
      let publicActivationEvent = null;
      if (status === 'approved') {
        const catalog = {
          'nexus-start': { name:'NEXUS START', price:35, dailyReturn:4.50, days:23, limit:1 },
          'nexus-tech': { name:'NEXUS TECH', price:100, dailyReturn:17.50, days:17, limit:1 },
          'nexus-agro': { name:'NEXUS AGRO', price:200, dailyReturn:38.50, days:16, limit:3 },
          'nexus-industrial': { name:'NEXUS INDUSTRIAL', price:300, dailyReturn:60.50, days:15, limit:2 },
          'nexus-energy': { name:'NEXUS ENERGY', price:600, dailyReturn:127.50, days:9, limit:1 },
          'nexus-crypto': { name:'NEXUS CRYPTO', price:1000, dailyReturn:212.75, days:9, limit:2 },
          'nexus-global': { name:'NEXUS GLOBAL', price:2500, dailyReturn:453.28, days:11, limit:2 },
          'nexus-prime': { name:'NEXUS PRIME', price:5000, dailyReturn:817.36, days:12, limit:2 }
        };
        const plan = catalog[item.planId];
        if (!plan || !item.uid) throw new Error('Plano ou cliente inválido.');
        const now = Date.now();
        const brNow = new Date(now - 3 * 60 * 60 * 1000);
        const firstCreditAt = Date.UTC(brNow.getUTCFullYear(), brNow.getUTCMonth(), brNow.getUTCDate(), 3, 0, 0) + 86400000;
        const id = 'INV_' + item.id.replace(/[^a-zA-Z0-9_-]/g, '_');
        const walletRef = ref(database, 'wallets/' + item.uid);
        const result = await runTransaction(walletRef, (current) => {
          const wallet = current || {};
          const activations = wallet.investmentActivations || {};
          if (activations[item.id]) {
            // Recuperação idempotente: se a ativação já ocorreu mas a confirmação do pedido falhou,
            // ainda concede o bônus uma única vez, sem duplicar o investimento.
            if (!wallet.signupBonusGranted) {
              return {
                ...wallet,
                withdrawableBalance: Number((Number(wallet.withdrawableBalance || 0) + 3.50).toFixed(2)),
                signupBonusGranted: true,
                signupBonusAmount: 3.50,
                signupBonusGrantedAt: now
              };
            }
            return wallet;
          }
          const investments = wallet.investments || {};
          const bought = Object.values(investments).filter((inv) => inv?.planId === item.planId).length;
          const balance = Number(wallet.depositBalance || 0);
          if (bought >= plan.limit || balance < plan.price) return;
          const investment = {
            instanceId:id, activationKey:item.id, planId:item.planId, name:plan.name,
            price:plan.price, dailyReturn:plan.dailyReturn, days:plan.days,
            startAt:now, firstCreditAt, endAt:firstCreditAt + plan.days * 86400000,
            status:'active', daysCredited:0, paidTotal:0,
            projectedTotal:Number((plan.dailyReturn * plan.days).toFixed(2)),
            timezone:'America/Sao_Paulo'
          };
          const grantSignupBonus = !wallet.signupBonusGranted;
          return {
            ...wallet,
            depositBalance:Number((balance - plan.price).toFixed(2)),
            withdrawableBalance:Number((Number(wallet.withdrawableBalance || 0) + (grantSignupBonus ? 3.50 : 0)).toFixed(2)),
            signupBonusGranted: grantSignupBonus ? true : Boolean(wallet.signupBonusGranted),
            ...(grantSignupBonus ? { signupBonusAmount:3.50, signupBonusGrantedAt:now } : {}),
            investments:{...investments,[id]:investment},
            investmentActivations:{...activations,[item.id]:id}
          };
        }, { applyLocally:false });
        const savedWallet = result.snapshot.val() || {};
        investmentId = savedWallet.investmentActivations?.[item.id] || '';
        if (!investmentId || !savedWallet.investments?.[investmentId]) {
          const bought = Object.values(savedWallet.investments || {}).filter((inv) => inv?.planId === item.planId).length;
          throw new Error(bought >= plan.limit ? 'Limite deste plano já atingido.' : 'Saldo de depósito insuficiente para aprovar este pedido.');
        }
        const activatedInvestment = savedWallet.investments[investmentId];
        if (plan.price >= 35 && plan.price <= 1000) {
          publicActivationEvent = {
            maskedId: 'ID ***' + String(item.uid).slice(-4),
            planName: plan.name,
            price: plan.price,
            activatedAt: Number(activatedInvestment.startAt || now)
          };
        }
      }
      const changes = {...item, status, investmentId: investmentId || null, updatedAt:Date.now(), updatedBy:firebaseUser.uid};
      await update(ref(database), {
        [path]:changes,
        ['investmentRequestsByUser/' + item.uid + '/' + item.id]:changes,
        ...(publicActivationEvent ? { ['publicActivationFeed/' + item.id]: publicActivationEvent } : {})
      });
      setNotice(status === 'approved' ? 'Plano ativado. O valor foi debitado da carteira e o ciclo começa à próxima meia-noite de Brasília.' : 'Pedido de ativação recusado.');
    } catch (error) {
      setNotice('Não foi possível processar o pedido: ' + (error?.message || 'erro desconhecido'));
    } finally { setBusy(false); }
  };

  const saveRequest=async(status) => {
    if(!selected || busy) return;
    if(selected._type==='withdrawal' && selected.status==='paid' && status!=='paid') { setNotice('Este saque já foi marcado como pago e não pode ser alterado.'); return; }
    if(selected._type==='withdrawal' && selected.status==='rejected' && status!=='rejected') { setNotice('Este saque foi recusado e estornado; não é possível aprová-lo novamente.'); return; }
    if(selected._type==='deposit' && selected.status==='paid' && status==='rejected') { setNotice('Este depósito já foi confirmado e creditado; não é possível recusá-lo.'); return; }
    if(selected._type==='deposit' && status==='awaiting_payment' && !pixCode.trim()) { setNotice('Cole o código PIX Copia e Cola gerado no seu banco.'); return; }
    setBusy(true); setNotice(status === 'approved' && selected._type === 'withdrawal' ? 'Processando aprovação e conferindo o saldo da carteira…' : 'Processando solicitação…');
    try {
      const path=(selected._type==='deposit'?'depositRequests/':'withdrawalRequests/')+selected.id;
      if (selected._type === 'deposit' && status === 'rejected') {
        // Remove o pedido recusado da fila administrativa e do espelho do cliente.
        // O registro não deve continuar aparecendo como "em processamento".
        await update(ref(database), {
          [path]: null,
          ['depositRequestsByUser/' + selected.uid + '/' + selected.id]: null
        });
        setDeposits((current) => current.filter((item) => item.id !== selected.id));
        setSelected(null);
        setFilter('all');
        setNotice('Depósito recusado e removido do painel.');
        return;
      }
      if (selected._type === 'withdrawal' && status === 'approved' && selected.status === 'pending') {
        const amount = Number(Number(selected.amount || 0).toFixed(2));
        if (!selected.uid || !Number.isFinite(amount) || amount <= 0) throw new Error('Pedido de saque sem usuário ou valor válido.');
        const walletRef = ref(database, 'wallets/' + selected.uid);
        const diagnostics = { planCount:0, openReservations:0, rewardsBalance:0, depositBalance:0, totalAvailable:0 };
        const reserveResult = await runTransaction(walletRef, (current) => {
          const wallet = current || {};
          const reservations = wallet.withdrawalReservations || {};
          if (reservations[selected.id]) return wallet;
          // Ignora a própria solicitação ao verificar se já existe outro saque em aberto.
          const openReservations = Object.entries(reservations).filter(([requestId, entry]) =>
            requestId !== selected.id && entry && entry.status === 'pending'
          );
          // A ativação válida é criada pelo painel em wallets/{uid}/investments/{id}, com instanceId.
          const investments = Object.values(wallet.investments || {});
          const activatedInvestments = investments.filter((investment) => investment && investment.instanceId);
          const rewardsBalance = Number(wallet.withdrawableBalance || 0);
          const depositBalance = Number(wallet.depositBalance || 0);
          const totalAvailable = Number((rewardsBalance + depositBalance).toFixed(2));
          Object.assign(diagnostics, {
            planCount:activatedInvestments.length,
            openReservations:openReservations.length,
            rewardsBalance,
            depositBalance,
            totalAvailable
          });
          if (!activatedInvestments.length || openReservations.length || totalAvailable < amount) return;
          // Usa primeiro o saldo de bônus/rendimentos e completa com o saldo de depósitos.
          const rewardsUsed = Math.min(rewardsBalance, amount);
          const depositUsed = Number((amount - rewardsUsed).toFixed(2));
          const record = {...selected, status:'approved', reservedAt:Date.now(), rewardsReserved:rewardsUsed, depositReserved:depositUsed};
          return {
            ...wallet,
            withdrawableBalance:Number((rewardsBalance - rewardsUsed).toFixed(2)),
            depositBalance:Number((depositBalance - depositUsed).toFixed(2)),
            withdrawalReservations:{...reservations,[selected.id]:record}
          };
        }, { applyLocally:false });
        if (!reserveResult.snapshot.child('withdrawalReservations').child(selected.id).exists()) {
          const reasons = [];
          if (!diagnostics.planCount) reasons.push('nenhum plano ativado foi encontrado na carteira');
          if (diagnostics.openReservations) reasons.push(diagnostics.openReservations + ' outro(s) saque(s) com reserva em aberto');
          if (diagnostics.totalAvailable < amount) reasons.push('saldo disponível de ' + money(diagnostics.totalAvailable) + ' menor que o saque de ' + money(amount));
          throw new Error((reasons.length ? reasons.join('; ') : 'a reserva não foi gravada') + '. O pedido continua pendente.');
        }
      }
      if (selected._type === 'withdrawal' && status === 'rejected' && selected.status === 'approved') {
        const walletRef = ref(database, 'wallets/' + selected.uid);
        const amount = Number(Number(selected.amount || 0).toFixed(2));
        const refundResult = await runTransaction(walletRef, (current) => {
          const wallet = current || {};
          const refunds = wallet.withdrawalRefunds || {};
          const reservations = wallet.withdrawalReservations || {};
          if (refunds[selected.id]) return wallet;
          if (!reservations[selected.id]) return;
          return {
            ...wallet,
            withdrawableBalance:Number((Number(wallet.withdrawableBalance || 0) + Number(reservations[selected.id].rewardsReserved ?? amount)).toFixed(2)),
            depositBalance:Number((Number(wallet.depositBalance || 0) + Number(reservations[selected.id].depositReserved || 0)).toFixed(2)),
            withdrawalReservations:{...reservations,[selected.id]:{...reservations[selected.id],status:'rejected',updatedAt:Date.now()}},
            withdrawalRefunds:{...refunds,[selected.id]:{amount,rewardsAmount:Number(reservations[selected.id].rewardsReserved ?? amount),depositAmount:Number(reservations[selected.id].depositReserved || 0),refundedAt:Date.now(),refundedBy:firebaseUser.uid}}
          };
        }, { applyLocally:false });
        if (!refundResult.snapshot.child('withdrawalRefunds').child(selected.id).exists()) throw new Error('O estorno não foi confirmado.');
      }
      if (selected._type === 'withdrawal' && status === 'rejected') {
        // O estorno (quando houver reserva) já foi confirmado acima. Agora remove o pedido
        // recusado das filas administrativa e do cliente, preservando o registro de estorno.
        await update(ref(database), {
          ['withdrawalRequests/' + selected.id]: null,
          ['withdrawalRequestsByUser/' + selected.uid + '/' + selected.id]: null
        });
        setWithdrawals((current) => current.filter((item) => item.id !== selected.id));
        setSelected(null);
        setFilter('all');
        setNotice('Saque recusado e removido do histórico da fila. Se havia reserva, o saldo foi estornado.');
        return;
      }
      if (selected._type === 'withdrawal' && status === 'paid') {
        if (selected.status !== 'approved') throw new Error('Aprove e reserve o saldo antes de marcar o saque como pago.');
        const walletRef = ref(database, 'wallets/' + selected.uid);
        const paidResult = await runTransaction(walletRef, (current) => {
          const wallet = current || {};
          const reservations = wallet.withdrawalReservations || {};
          if (!reservations[selected.id]) return;
          return {...wallet, withdrawalReservations:{...reservations,[selected.id]:{...reservations[selected.id],status:'paid',paidAt:Date.now()}}};
        }, { applyLocally:false });
        if (!paidResult.snapshot.child('withdrawalReservations').child(selected.id).exists()) throw new Error('Não foi encontrada a reserva deste saque.');
      }
      if (selected._type === 'deposit' && status === 'paid') {
        const walletRef = ref(database, 'wallets/' + selected.uid);
        const amount = Number(Number(selected.amount || 0).toFixed(2));
        if (!selected.uid || !Number.isFinite(amount) || amount <= 0) throw new Error('Pedido sem usuário ou valor válido.');
        const creditResult = await runTransaction(walletRef, (current) => {
          const wallet = current || {};
          const credits = wallet.depositCredits || {};
          // O mesmo pedido nunca pode creditar duas vezes, mesmo se o admin clicar novamente.
          if (credits[selected.id]) return wallet;
          return {
            ...wallet,
            depositBalance: Number((Number(wallet.depositBalance || 0) + amount).toFixed(2)),
            depositCredits: {
              ...credits,
              [selected.id]: { amount, creditedAt: Date.now(), transactionId: txId.trim() }
            }
          };
        }, { applyLocally: false });
        if (!creditResult.snapshot.child('depositCredits').child(selected.id).exists()) {
          throw new Error('O Firebase não confirmou o crédito na carteira. O pedido continua pendente; tente novamente.');
        }
        // Grava o histórico e remove o pedido pendente em uma única operação
        // multipath. Assim o saldo nunca fica confirmado sem o respectivo registro.
        const confirmedAt = Date.now();
        await update(ref(database), {
          ['depositHistory/' + selected.uid + '/' + selected.id]: {
            uid: selected.uid,
            amount,
            status: 'paid',
            confirmedAt,
            createdAt: Number(selected.createdAt || confirmedAt),
            transactionId: txId.trim(),
            requestId: selected.id
          },
          [path]: null,
          ['depositRequestsByUser/' + selected.uid + '/' + selected.id]: null
        });
        setDeposits((current) => current.filter((item) => item.id !== selected.id));
        setSelected(null);
        setFilter('all');
        setNotice('✓ Depósito aprovado, saldo creditado uma única vez e pedido removido da fila de processamento.');
        return;
      }
      // Preserva os campos obrigatórios do pedido: o Realtime Database valida
      // o registro completo e não pode receber apenas os campos alterados.
      const changes = {
        uid: selected.uid,
        email: selected.email || '',
        name: selected.name || '',
        cpf: selected.cpf || '',
        holderName: selected.holderName || selected.name || '',
        pixKeyType: selected.pixKeyType || '',
        pixKey: selected.pixKey || '',
        feeAmount: Number(selected.feeAmount || 0),
        netAmount: Number(selected.netAmount || selected.amount || 0),
        amount: Number(selected.amount || 0),
        createdAt: Number(selected.createdAt || Date.now()),
        status,
        pixCopyPaste:pixCode.trim(),
        transactionId:txId.trim(),
        adminNote:note.trim(),
        updatedAt:Date.now(),
        updatedBy:firebaseUser.uid
      };
      if (selected._type === 'deposit') {
        await update(ref(database), {
          [path]: changes,
          ['depositRequestsByUser/' + selected.uid + '/' + selected.id]: changes
        });
      } else {
        await update(ref(database), {
          [path]: changes,
          ['withdrawalRequestsByUser/' + selected.uid + '/' + selected.id]: changes
        });
      }
      if (selected._type === 'deposit' && status === 'awaiting_payment') {
        // Mantém o pedido aberto no painel para o admin acompanhar até aprovar ou rejeitar.
        setSelected({ ...selected, ...changes, _type: 'deposit' });
        setNotice('✓ Código PIX enviado ao cliente. O pedido continua nesta aba como “PIX enviado” até você confirmar o recebimento ou rejeitar.');
      } else {
        setSelected(null);
        setNotice(status === 'paid' && selected._type === 'deposit'
          ? '✓ Depósito confirmado. O crédito foi verificado na carteira do cliente e registrado uma única vez.'
          : 'Registro atualizado no Firebase. Confira o extrato bancário antes de confirmar pagamentos.');
      }
    } catch(e) { setNotice('Não foi possível salvar: '+(e?.message || 'verifique as permissões do Firebase.')); }
    finally { setBusy(false); }
  };

  if(!isAdmin) return <main className="min-h-screen grid place-items-center bg-slate-950 p-6 text-white"><section className="max-w-md rounded-3xl border border-rose-400/20 bg-slate-900 p-8 text-center"><ShieldCheck className="mx-auto mb-4 text-rose-300" size={42}/><h1 className="text-2xl font-black">Acesso restrito</h1><p className="mt-2 text-slate-300">Esta conta não está autorizada a acessar a administração.</p><button onClick={()=>window.location.href='/'} className="mt-6 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">Voltar à plataforma</button></section></main>;

  const nav=<div className="flex h-full flex-col">
    <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5"><div className="rounded-xl bg-cyan-400/15 p-2.5 text-cyan-300"><ShieldCheck size={24}/></div><div><p className="text-[10px] font-black tracking-[.25em] text-cyan-300">NEXUS AÇÕES</p><p className="text-lg font-black">Central Admin</p></div></div>
    <nav className="flex-1 space-y-1 p-3">{NAV.map(([id,label,Icon])=><button key={id} onClick={()=>{setSection(id);setSelected(null);setMobileNav(false);setSearch('');setFilter('all');}} className={'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition '+(section===id?'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/30':'text-slate-200 hover:bg-white/5 hover:text-white')}><Icon size={18}/>{label}{id==='deposits' && pendingDeposits.length>0 ? <span className="ml-auto rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-black text-slate-950">{pendingDeposits.length}</span> : null}{id==='withdrawals' && pendingWithdrawals.length>0 ? <span className="ml-auto rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-black text-slate-950">{pendingWithdrawals.length}</span> : null}{id==='investment-requests' && pendingInvestmentRequests.length>0 ? <span className="ml-auto rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-black text-slate-950">{pendingInvestmentRequests.length}</span> : null}</button>)}</nav>
    <div className="border-t border-white/10 p-4"><p className="truncate text-xs text-slate-200">{firebaseUser.email}</p><button onClick={()=>signOut(auth)} className="mt-3 flex w-full items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"><LogOut size={16}/> Sair da conta</button></div>
  </div>;

  const metric=(label,value,Icon,color='text-cyan-300',hint='')=><div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-200">{label}</span><Icon className={color} size={20}/></div><p className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">{value}</p>{hint?<p className="mt-1 text-[11px] text-slate-300">{hint}</p>:null}</div>;

  const requestWorkspace=(type) => <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,.9fr)]">
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80">
      <div className="space-y-3 border-b border-white/10 p-4"><div className="flex items-center justify-between gap-3"><div><h3 className="font-bold">{type==='deposit'?'Fila de depósitos':'Fila de saques'}</h3><p className="text-xs text-slate-300">Pedidos sincronizados pelo Firebase</p></div><button onClick={()=>setNotice('A lista é atualizada automaticamente em tempo real.')} className="rounded-lg border border-white/10 p-2 text-slate-200"><RefreshCw size={16}/></button></div>
      <div className="relative"><Search className="absolute left-3 top-3 text-slate-300" size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar cliente, e-mail, PIX ou código..." className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-cyan-400"/></div>
      <div className="flex flex-wrap gap-2">{[['all','Todos'],['pending','Pendentes'],...(type==='deposit'?[['awaiting_payment','PIX enviado']]:[['approved','Aprovados']]),['paid','Pagos']].map(([v,l])=><button key={v} onClick={()=>setFilter(v)} className={'rounded-full px-3 py-1.5 text-xs font-bold '+(filter===v?'bg-cyan-400 text-slate-950':'bg-slate-800 text-slate-300')}>{l}</button>)}</div></div>
      <div className="max-h-[650px] overflow-y-auto">{loading?<p className="p-6 text-sm text-slate-200">Carregando registros...</p>:filtered.length===0?<div className="p-10 text-center text-sm text-slate-300"><ClipboardList className="mx-auto mb-3" size={30}/>Nenhum pedido nesta lista.</div>:filtered.map(item=><button key={item.id} onClick={()=>openRequest(item,type)} className={'block w-full border-b border-white/5 p-4 text-left hover:bg-white/5 '+(selected?.id===item.id?'bg-cyan-400/10':'')}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-bold">{item.name||item.email||item.uid||'Cliente'}</p><p className="mt-1 truncate text-xs text-slate-300">{item.email||item.uid||item.id}</p><p className="mt-2 text-[11px] text-slate-300">{date(item.createdAt)}</p></div><div className="shrink-0 text-right"><p className="font-black">{money(item.amount)}</p><span className={'mt-1 inline-block rounded-full px-2 py-1 text-[10px] font-bold '+statusClass(item.status)}>{statusLabel(item.status)}</span></div></div></button>)}</div>
    </section>
    <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">{!selected||selected._type!==type?<div className="grid min-h-80 place-items-center text-center text-slate-300"><div><UserRound className="mx-auto mb-3" size={36}/><p>Selecione um pedido para consultar os detalhes e administrar.</p></div></div>:<div className="space-y-4">
      {notice?<div role="status" aria-live="polite" className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-3 text-sm leading-relaxed text-cyan-100"><div className="flex items-start gap-2"><AlertCircle className="mt-0.5 shrink-0" size={17}/><span>{notice}</span></div></div>:null}
      <div><p className="text-[10px] font-black tracking-[.2em] text-cyan-300">DETALHES DO PEDIDO</p><h3 className="mt-1 text-2xl font-black">{money(selected.amount)}</h3>{type==='withdrawal'?<div className="mt-1 space-y-1 text-xs"><p className="font-bold text-amber-300">Taxa (6%): {money(selected.feeAmount || 0)}</p><p className="font-bold text-emerald-300">Valor líquido para transferir: {money(selected.netAmount ?? selected.amount)}</p></div>:null}<p className="break-all text-xs text-slate-300">{selected.id}</p></div>
      <div className="grid grid-cols-2 gap-2 text-sm"><div className="rounded-xl bg-slate-950 p-3"><p className="text-[10px] text-slate-300">Cliente</p><p className="mt-1 break-all">{selected.name||'—'}</p></div><div className="rounded-xl bg-slate-950 p-3"><p className="text-[10px] text-slate-300">Status</p><p className="mt-1">{statusLabel(selected.status)}</p>{type==='deposit' && selected.status==='awaiting_payment' && (selected.pixCopyPaste||selected.pixCode)?<p className="mt-2 text-xs font-bold text-emerald-300">✓ Código PIX enviado e disponível para o cliente em tempo real</p>:null}</div><div className="col-span-2 rounded-xl bg-slate-950 p-3"><p className="text-[10px] text-slate-300">E-mail / UID</p><p className="mt-1 break-all">{selected.email||'—'} / {selected.uid||'—'}</p></div>
      {type==='withdrawal'?<><div className="col-span-2 rounded-xl bg-slate-950 p-3"><p className="text-[10px] text-slate-300">CPF do solicitante</p><p className="mt-1 break-all font-semibold">{selected.cpf||selected.withdrawCpf||'Não informado'}</p></div><div className="col-span-2 rounded-xl bg-slate-950 p-3"><p className="text-[10px] text-slate-300">Titular da conta bancária</p><p className="mt-1 break-all font-semibold">{selected.holderName||selected.accountHolderName||selected.withdrawHolderName||'Não informado'}</p></div><div className="col-span-2 rounded-xl bg-slate-950 p-3"><p className="text-[10px] text-slate-300">Chave PIX ({selected.pixKeyType||'tipo não informado'})</p><p className="mt-1 break-all font-semibold">{selected.pixKey||'Não informada'}</p></div></>:null}
      <div className="col-span-2 rounded-xl bg-slate-950 p-3"><p className="text-[10px] text-slate-300">Criado em</p><p className="mt-1">{date(selected.createdAt)}</p></div></div>
      {type==='deposit'?<div><label className="block text-xs font-bold text-slate-300">Cole somente o código PIX Copia e Cola<textarea value={pixCode} onChange={e=>setPixCode(e.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-white placeholder:text-slate-200 outline-none focus:border-cyan-400" placeholder="Cole aqui o código PIX Copia e Cola gerado no seu banco"/></label><p className="mt-2 rounded-lg border border-cyan-400/20 bg-cyan-400/5 p-3 text-xs leading-relaxed text-cyan-100">Não precisa enviar imagem nem QR Code. Basta colar o código PIX aqui e tocar em “Enviar PIX ao cliente”. O QR Code será gerado automaticamente na tela do cliente a partir desse código.</p></div>:null}

      {type==='deposit'?<div className="grid grid-cols-2 gap-2"><button disabled={busy} onClick={()=>saveRequest('awaiting_payment')} className="rounded-xl bg-cyan-400 px-3 py-3 text-sm font-black text-slate-950 disabled:opacity-50"><QrCode className="mr-1 inline" size={16}/> Enviar código PIX</button><button type="button" disabled={busy} onClick={()=>saveRequest('rejected')} className="rounded-xl bg-rose-500/15 px-3 py-3 text-sm font-bold text-rose-300 disabled:opacity-50">Recusar</button><button type="button" disabled={busy} onClick={()=>saveRequest('paid')} className="col-span-2 rounded-xl bg-emerald-400 px-3 py-3 font-black text-slate-950 disabled:opacity-50"><CheckCircle2 className="mr-1 inline" size={17}/> Confirmar depósito recebido</button></div>:<div className="grid grid-cols-2 gap-2"><button type="button" disabled={busy} onClick={()=>saveRequest('approved')} className="rounded-xl bg-cyan-400 px-3 py-3 text-sm font-black text-slate-950 disabled:cursor-wait disabled:opacity-60">{busy?'Processando…':'Aprovar saque'}</button><button disabled={busy} onClick={()=>saveRequest('rejected')} className="rounded-xl bg-rose-500/15 px-3 py-3 text-sm font-bold text-rose-300">Recusar</button><button disabled={busy} onClick={()=>saveRequest('paid')} className="col-span-2 rounded-xl bg-emerald-400 px-3 py-3 font-black text-slate-950 disabled:opacity-50">Confirmar saque pago</button></div>}
      <p className="text-[11px] leading-relaxed text-amber-200/80">{type==='deposit'?'O código PIX só deve ser enviado depois de gerado no banco. Confirme como recebido apenas após verificar o crédito no extrato.':'A aprovação não transfere dinheiro. Faça a transferência no banco e só então marque como pago.'}</p>
    </div>}</section>
  </div>;

  return <main className="admin-panel min-h-screen bg-[#07111f] text-white">
    <div className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 bg-[#091525] lg:block">{nav}</div>
    {mobileNav?<div className="fixed inset-0 z-50 bg-black/70 lg:hidden" onClick={()=>setMobileNav(false)}><aside className="h-full w-72 bg-[#091525]" onClick={e=>e.stopPropagation()}>{nav}</aside></div>:null}
    <div className="lg:pl-64">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#07111f]/90 px-4 py-3 backdrop-blur-xl sm:px-6"><div className="flex items-center gap-3"><button onClick={()=>setMobileNav(true)} className="rounded-lg border border-white/10 p-2 lg:hidden"><Menu size={19}/></button><div><p className="text-[10px] font-bold tracking-[.2em] text-cyan-300">NEXUS AÇÕES / ADMIN</p><h1 className="text-lg font-black sm:text-xl">{NAV.find(x=>x[0]===section)?.[1]}</h1></div></div><div className="flex items-center gap-2"><span className="hidden max-w-48 truncate text-xs text-slate-200 sm:block">{firebaseUser.email}</span><button onClick={()=>window.location.href='/'} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/5"><ExternalLink size={15}/> Plataforma</button></div></header>
      <div className="mx-auto max-w-[1500px] space-y-6 p-4 sm:p-6">
        {notice?<div className="flex items-start gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-100"><AlertCircle className="mt-0.5 shrink-0" size={17}/>{notice}<button className="ml-auto" onClick={()=>setNotice('')}><X size={16}/></button></div>:null}
        {section==='overview'?<><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-slate-200">Resumo operacional</p><h2 className="text-2xl font-black sm:text-3xl">Visão geral</h2><p className="mt-1 text-xs text-slate-300">Indicadores calculados a partir dos registros disponíveis no Firebase.</p></div><span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300"><Activity size={14}/> Sincronização em tempo real</span></div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{metric('Clientes cadastrados',profiles.length,Users)}{metric('Depósitos aguardando',pendingDeposits.length,ArrowDownToLine,'text-amber-300')}{metric('Saques aguardando',pendingWithdrawals.length,ArrowUpFromLine,'text-amber-300')}{metric('Planos aguardando',pendingInvestmentRequests.length,Activity,'text-amber-300')}{metric('Carteiras encontradas',wallets.length,Wallet,'text-violet-300')}</div>
          <div className="grid gap-3 xl:grid-cols-2">{metric('Total de depósitos confirmados',money(depositTotal),CircleDollarSign,'text-emerald-300','Somente registros com status Pago')}{metric('Total de saques marcados como pagos',money(paidWithdrawals),CircleDollarSign,'text-cyan-300','Registro administrativo; não consulta seu banco')}</div>
          <section className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-lg font-black">Depósitos para atender</h3><p className="text-xs text-slate-200">Os novos pedidos aparecem aqui automaticamente. Selecione um pedido para colar o PIX e enviar ao cliente.</p></div><span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-slate-950">{pendingDeposits.length} aguardando</span></div>{pendingDeposits.length>0?requestWorkspace('deposit'):<div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 text-center"><CheckCircle2 className="mx-auto mb-2 text-emerald-300" size={28}/><p className="font-semibold">Nenhum depósito aguardando atendimento</p><p className="mt-1 text-xs text-slate-300">Quando um cliente solicitar um depósito, o pedido aparecerá automaticamente nesta tela.</p></div>}</section>
          <div className="grid gap-4 xl:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5"><h3 className="font-bold">Ações rápidas</h3><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={()=>setSection('deposits')} className="rounded-xl bg-cyan-400/10 p-4 text-left text-sm font-bold text-cyan-200 hover:bg-cyan-400/20"><ArrowDownToLine className="mb-2" size={20}/> Ver depósitos</button><button onClick={()=>setSection('withdrawals')} className="rounded-xl bg-amber-400/10 p-4 text-left text-sm font-bold text-amber-200 hover:bg-amber-400/20"><ArrowUpFromLine className="mb-2" size={20}/> Ver saques</button><button onClick={()=>setSection('investment-requests')} className="rounded-xl bg-amber-400/10 p-4 text-left text-sm font-bold text-amber-200 hover:bg-amber-400/20"><Activity className="mb-2" size={20}/> Aprovar planos <span className="ml-1 rounded-full bg-amber-300 px-1.5 py-0.5 text-[10px] text-slate-950">{pendingInvestmentRequests.length}</span></button><button onClick={()=>setSection('users')} className="rounded-xl bg-violet-400/10 p-4 text-left text-sm font-bold text-violet-200 hover:bg-violet-400/20"><Users className="mb-2" size={20}/> Consultar clientes</button><button onClick={()=>setSection('reports')} className="rounded-xl bg-emerald-400/10 p-4 text-left text-sm font-bold text-emerald-200 hover:bg-emerald-400/20"><BarChart3 className="mb-2" size={20}/> Relatórios</button></div></div><div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5"><div className="flex items-center gap-2 text-amber-200"><AlertCircle size={19}/><h3 className="font-bold">Atenção: processamento manual</h3></div><p className="mt-2 text-sm leading-relaxed text-slate-300">Este painel registra suas ações. Ele não consulta o extrato bancário nem realiza transferências. Envie o código PIX verdadeiro e confirme depósitos ou saques somente após a verificação no banco.</p></div></div>
        </>:null}
        {section==='deposits'?<><div><h2 className="text-2xl font-black">Gestão de depósitos</h2><p className="mt-1 text-sm text-slate-200">Cole o PIX gerado no seu banco e disponibilize o código ao cliente.</p></div><div className="grid gap-3 sm:grid-cols-3">{metric('Pedidos ativos',visibleDeposits.length,ClipboardList)}{metric('Aguardando PIX',pendingDeposits.length,Clock3,'text-amber-300')}{metric('Confirmado no painel',money(depositTotal),CircleDollarSign,'text-emerald-300')}</div>{requestWorkspace('deposit')}</>:null}
        {section==='withdrawals'?<><div><h2 className="text-2xl font-black">Gestão de saques</h2><p className="mt-1 text-sm text-slate-200">Consulte a chave PIX, faça a transferência e registre a confirmação.</p></div><div className="grid gap-3 sm:grid-cols-3">{metric('Solicitações',withdrawals.length,ClipboardList)}{metric('Aguardando análise',pendingWithdrawals.length,Clock3,'text-amber-300')}{metric('Marcado como pago',money(paidWithdrawals),CircleDollarSign,'text-emerald-300')}</div>{requestWorkspace('withdrawal')}</>:null}
        {section==='users'?<><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-2xl font-black">Cadastro e ficha completa dos clientes</h2><p className="mt-1 text-base text-white">Abra um cliente para consultar saldos, planos, bônus e movimentações registradas.</p></div><span className="rounded-xl bg-cyan-400/15 px-4 py-2 text-base font-bold text-white">{clientRows.length} clientes</span></div><div className="relative max-w-2xl"><Search className="absolute left-3 top-3.5 text-white" size={20}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nome, e-mail ou UID" className="w-full rounded-xl border border-white/20 bg-slate-900 py-3.5 pl-11 pr-4 text-base text-white placeholder:text-slate-300 outline-none focus:border-cyan-400"/></div><div className="grid gap-3">{clientRows.map(x=>{const w=x.wallet;const opened=selectedClientUid===x.uid;return <article key={x.uid} className="overflow-hidden rounded-2xl border border-white/15 bg-slate-900/90"><button onClick={()=>setSelectedClientUid(opened?'':x.uid)} className="grid w-full gap-3 p-4 text-left sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:p-5"><div className="min-w-0"><p className="text-lg font-extrabold text-white">{x.name}</p><p className="break-all text-base text-white">{x.email||'E-mail não informado'}</p><p className="mt-1 break-all text-sm text-white">UID: {x.uid}</p></div><div className="text-left sm:text-right"><p className="text-sm text-white">Saldo sacável</p><p className="text-xl font-black text-white">{money(w.withdrawableBalance)}</p></div><div className="text-left sm:text-right"><p className="text-sm text-white">Saldo de depósito</p><p className="text-xl font-black text-white">{money(w.depositBalance)}</p><span className="text-sm text-cyan-200">{opened?'Fechar ficha ▲':'Ver ficha completa ▼'}</span></div></button>{opened?<div className="space-y-5 border-t border-white/15 p-4 sm:p-5"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metric('Saldo sacável',money(w.withdrawableBalance),Wallet)}{metric('Saldo de depósito',money(w.depositBalance),CircleDollarSign)}{metric('Check-ins',Number(w.checkinCount||0),Gift)}{metric('Bônus de cadastro',w.signupBonusGranted?money(w.signupBonusAmount||3.5):'Não concedido',CheckCircle2)}</div><div className="grid gap-4 lg:grid-cols-2"><section className="rounded-xl border border-white/15 bg-slate-950/60 p-4"><h3 className="mb-3 text-lg font-bold text-white">Dados cadastrais</h3><p className="break-all text-base text-white">Nome: {x.name}</p><p className="break-all text-base text-white">E-mail: {x.email||'—'}</p><p className="break-all text-sm text-white">UID: {x.uid}</p><p className="text-base text-white">Cadastro: {date(x.profile.createdAt)}</p><p className="break-all text-base text-white">Código de convite: {x.profile.inviteCode||'—'}</p><p className="break-all text-base text-white">Indicado por UID: {x.profile.referrerUid||'—'}</p><button onClick={()=>{navigator.clipboard?.writeText(x.uid);setNotice('UID copiado.')}} className="mt-3 rounded-lg border border-white/20 px-4 py-2 text-base text-white"><Copy className="mr-2 inline" size={16}/>Copiar UID</button></section><section className="rounded-xl border border-white/15 bg-slate-950/60 p-4"><h3 className="mb-3 text-lg font-bold text-white">Situação da carteira</h3><p className="text-base text-white">Último check-in: {date(w.lastCheckinAt)}</p><p className="text-base text-white">Bônus concedido: {w.signupBonusGranted?'Sim':'Não'}</p><p className="text-base text-white">Investimentos ativos: {Object.values(w.investments||{}).filter(v=>v.status==='active').length}</p><p className="text-base text-white">Créditos de rendimento: {Object.keys(w.yieldCredits||{}).length}</p><p className="text-base text-white">Ativações registradas: {Object.keys(w.investmentActivations||{}).length}</p></section></div><section className="rounded-xl border border-white/15 bg-slate-950/60 p-4"><h3 className="mb-3 text-lg font-bold text-white">Planos e investimentos</h3>{Object.entries(w.investments||{}).length?Object.entries(w.investments||{}).map(([id,inv])=><div key={id} className="border-b border-white/10 py-3 last:border-0"><p className="text-base font-bold text-white">{inv.name||inv.planId||'Plano'} · {money(inv.price)}</p><p className="text-sm text-white">Status: {inv.status||'—'} · Início: {date(inv.startAt)} · Fim: {date(inv.endAt)}</p><p className="text-sm text-white">Retorno diário cadastrado: {money(inv.dailyReturn)} · Já pago: {money(inv.paidTotal)} · Dias creditados: {Number(inv.daysCredited||0)}/{Number(inv.days||0)}</p></div>):<p className="text-base text-white">Nenhum investimento registrado.</p>}</section><div className="grid gap-4 lg:grid-cols-3"><section className="rounded-xl border border-white/15 bg-slate-950/60 p-4"><h3 className="mb-2 text-lg font-bold text-white">Depósitos</h3>{deposits.filter(v=>v.uid===x.uid).length?deposits.filter(v=>v.uid===x.uid).map(v=><p key={v.id} className="border-b border-white/10 py-2 text-sm text-white">{money(v.amount)} · {statusLabel(v.status)} · {date(v.createdAt)}</p>):<p className="text-base text-white">Sem registros.</p>}</section><section className="rounded-xl border border-white/15 bg-slate-950/60 p-4"><h3 className="mb-2 text-lg font-bold text-white">Saques</h3>{withdrawals.filter(v=>v.uid===x.uid).length?withdrawals.filter(v=>v.uid===x.uid).map(v=><p key={v.id} className="border-b border-white/10 py-2 text-sm text-white">{money(v.amount)} · {statusLabel(v.status)} · {date(v.createdAt)}</p>):<p className="text-base text-white">Sem registros.</p>}</section><section className="rounded-xl border border-white/15 bg-slate-950/60 p-4"><h3 className="mb-2 text-lg font-bold text-white">Pedidos de planos</h3>{investmentRequests.filter(v=>v.uid===x.uid).length?investmentRequests.filter(v=>v.uid===x.uid).map(v=><p key={v.id} className="border-b border-white/10 py-2 text-sm text-white">{v.planName||v.planId} · {money(v.price)} · {statusLabel(v.status)} · {date(v.createdAt)}</p>):<p className="text-base text-white">Sem registros.</p>}</section></div></div>:null}</article>})}{clientRows.length===0?<p className="rounded-xl border border-white/15 bg-slate-900 p-6 text-center text-base text-white">Nenhum cliente encontrado. Verifique as permissões de leitura no Firebase.</p>:null}</div></>:null}
        {section==='wallets'?<><div><h2 className="text-2xl font-black">Saldos de todos os clientes</h2><p className="mt-1 text-base text-white">Valores exibidos conforme os registros atuais do Realtime Database.</p></div><div className="grid gap-3 sm:grid-cols-2">{metric('Saldo sacável total',money(wallets.reduce((n,w)=>n+Number(w.withdrawableBalance||0),0)),Wallet)}{metric('Saldo de depósito total',money(wallets.reduce((n,w)=>n+Number(w.depositBalance||0),0)),CircleDollarSign)}</div><div className="overflow-hidden rounded-2xl border border-white/15 bg-slate-900/90">{wallets.map(w=>{const p=profiles.find(v=>v.id===w.id)||{};return <button key={w.id} onClick={()=>{setSection('users');setSelectedClientUid(w.id);setSearch('');}} className="grid w-full gap-2 border-b border-white/10 p-4 text-left sm:grid-cols-4"><div className="break-all text-base font-bold text-white sm:col-span-2">{p.displayName||p.name||p.email||'Cliente'}<p className="break-all text-sm font-normal text-white">UID: {w.id}</p></div><div><p className="text-sm text-white">Saldo sacável</p><p className="text-lg font-black text-white">{money(w.withdrawableBalance)}</p></div><div><p className="text-sm text-white">Saldo de depósito</p><p className="text-lg font-black text-white">{money(w.depositBalance)}</p><p className="text-sm text-white">Check-ins: {Number(w.checkinCount||0)}</p></div></button>})}{wallets.length===0?<p className="p-8 text-center text-base text-white">Nenhuma carteira retornada.</p>:null}</div></>:null}
        {section==='bonuses'?<><div><h2 className="text-2xl font-black">Bônus e check-ins</h2><p className="mt-1 text-sm text-slate-200">Visão de acompanhamento dos dados de carteira.</p></div><div className="grid gap-3 sm:grid-cols-3">{metric('Carteiras com check-in',wallets.filter(x=>Number(x.checkinCount||0)>0).length,Gift,'text-violet-300')}{metric('Check-ins registrados',wallets.reduce((n,x)=>n+Number(x.checkinCount||0),0),CheckCircle2)}{metric('Saldo de carteira somado',money(wallets.reduce((n,x)=>n+Number(x.withdrawableBalance||0),0)),Wallet,'text-emerald-300')}</div><p className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100">Crédito e alteração de bônus precisam ser executados por uma rotina de servidor com validação e histórico imutável. Este painel não inventa nem credita valores.</p></>:null}
        {section==='investment-requests'?<><div><h2 className="text-2xl font-black">Ativações de planos</h2><p className="mt-1 text-sm text-slate-200">Confira o saldo do cliente antes de aprovar. A ativação debita o valor apenas após sua confirmação.</p></div><div className="grid gap-3 sm:grid-cols-3">{metric('Pedidos recebidos',investmentRequests.length,ClipboardList)}{metric('Aguardando aprovação',pendingInvestmentRequests.length,Clock3,'text-amber-300')}{metric('Planos ativos',investmentRows.length,Activity,'text-emerald-300')}</div><div className="space-y-3">{investmentRequests.length===0?<p className="rounded-xl border border-white/10 bg-slate-900/80 p-5 text-sm text-slate-300">Nenhum pedido de ativação recebido.</p>:investmentRequests.map((item)=><article key={item.id} className="rounded-2xl border border-white/10 bg-slate-900/80 p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-black">{item.planName||item.planId||'Plano'}</h3><p className="mt-1 break-all text-xs text-slate-300">{item.email||item.uid}</p><p className="text-[11px] text-slate-400">UID: {item.uid} · Pedido: {date(item.createdAt)}</p><p className="mt-1 text-xs text-slate-300">{Number(item.days||0)} dias · {money(item.dailyReturn)} previstos/dia · Total ilustrativo: {money(Number(item.dailyReturn||0)*Number(item.days||0))}</p></div><div className="text-right"><p className="text-lg font-black">{money(item.price)}</p><span className={'inline-block rounded-full px-2 py-1 text-[10px] font-bold '+statusClass(item.status)}>{statusLabel(item.status)}</span></div></div>{item.status==='pending'?<div className="mt-3 grid grid-cols-2 gap-2"><button disabled={busy} onClick={()=>approveInvestmentRequest(item,'approved')} className="rounded-xl bg-emerald-400 px-3 py-2.5 text-sm font-black text-slate-950 disabled:opacity-50">Conferir saldo e aprovar</button><button disabled={busy} onClick={()=>approveInvestmentRequest(item,'rejected')} className="rounded-xl bg-rose-500/15 px-3 py-2.5 text-sm font-bold text-rose-300 disabled:opacity-50">Recusar pedido</button></div>:<p className="mt-3 text-xs text-slate-400">{item.status==='approved'?'Investimento ativado e debitado da carteira.': 'Pedido encerrado.'}</p>}</article>)}</div></>:null}
        {section==='yields'?<><div><h2 className="text-2xl font-black">Rendimentos dos investimentos</h2><p className="mt-1 text-sm text-slate-200">Selecione um plano para preencher o pagamento diário. O valor só entra no saldo sacável quando você confirmar aqui.</p></div>
          <div className="grid gap-3 lg:grid-cols-2">{investmentRows.length===0?<p className="rounded-xl border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">Nenhum investimento ativado até agora.</p>:investmentRows.map((inv)=>{const first=Number(inv.firstCreditAt||0);const day=first&&Date.now()>=first?Math.min(Number(inv.days||0),Math.floor((Date.now()-first)/86400000)+1):0;const refKey=day?inv.instanceId+'_D'+day:'';const already=Boolean(refKey&&inv.wallet.yieldCredits?.[refKey]);return <div key={inv.instanceId} className="rounded-2xl border border-white/10 bg-slate-900/80 p-4"><div className="flex items-start justify-between gap-3"><div><div className="font-black">{inv.name}</div><div className="mt-1 text-[11px] text-slate-300">UID: {inv.uid}</div><div className="text-[11px] text-slate-300">Ativado: {date(inv.startAt)}</div></div><span className="rounded-full bg-cyan-400/10 px-2 py-1 text-[10px] font-bold text-cyan-200">{day}/{inv.days} dias</span></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg bg-slate-950 p-2"><div className="text-slate-400">Previsto/dia</div><strong>{money(inv.dailyReturn)}</strong></div><div className="rounded-lg bg-slate-950 p-2"><div className="text-slate-400">Já lançado</div><strong>{money(inv.paidTotal)}</strong></div></div><button disabled={!day||already||yieldBusy} onClick={()=>{setYieldUid(inv.uid);setYieldAmount(String(inv.dailyReturn));setYieldReference(refKey);setYieldDescription('Rendimento '+inv.name+' - dia '+day);setYieldInvestmentId(inv.instanceId);setNotice(already?'Este dia já foi lançado.':'Dados preenchidos abaixo. Confira o pagamento e confirme.');}} className="mt-3 w-full rounded-xl bg-cyan-400 px-3 py-2.5 text-xs font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">{already?'Dia já creditado':day?'Preencher pagamento do dia '+day:'Aguardando primeiro dia às 00:00'}</button></div>})}</div>
          <form onSubmit={creditManualYield} className="max-w-2xl space-y-4 rounded-2xl border border-white/10 bg-slate-900/80 p-5">
            <h3 className="font-bold">Confirmar crédito manual</h3>
            <label className="block text-xs font-bold text-slate-200">UID do cliente<input value={yieldUid} onChange={e=>setYieldUid(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-white outline-none focus:border-cyan-400" placeholder="UID do cliente" required/></label>
            <label className="block text-xs font-bold text-slate-200">Valor confirmado (R$)<input type="number" min="0.01" max="1000000" step="0.01" value={yieldAmount} onChange={e=>setYieldAmount(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-white outline-none focus:border-cyan-400" placeholder="0,00" required/></label>
            <label className="block text-xs font-bold text-slate-200">Referência única<input value={yieldReference} onChange={e=>setYieldReference(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-white outline-none focus:border-cyan-400" placeholder="Ex.: INV123_D1" required/><span className="mt-1 block text-[11px] font-normal text-slate-300">A mesma referência não pode ser creditada duas vezes.</span></label>
            <label className="block text-xs font-bold text-slate-200">Descrição<input value={yieldDescription} onChange={e=>setYieldDescription(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-white outline-none focus:border-cyan-400" maxLength={120}/></label>
            <button type="submit" disabled={yieldBusy} className="w-full rounded-xl bg-emerald-400 px-4 py-3 font-black text-slate-950 disabled:opacity-50">{yieldBusy?'Registrando...':'Confirmar crédito no saldo sacável'}</button>
            <p className="text-[11px] leading-relaxed text-amber-200/90">Este lançamento altera o saldo interno no Firebase; não faz transferência bancária. Confira o pagamento antes de confirmar. O lançamento também atualiza o total pago e os dias creditados do plano selecionado.</p>
          </form></>:null}
        {section==='accesses'?<><div><h2 className="text-2xl font-black">Acessos ao site</h2><p className="mt-1 text-sm text-slate-200">Visitas registradas quando o site é aberto neste navegador. Visitantes diferentes são estimados por identificador aleatório armazenado no próprio navegador.</p></div><div className="rounded-xl border border-cyan-300/20 bg-slate-950/70 p-4 text-xs text-slate-200"><p className="font-bold text-cyan-200">Diagnóstico de autorização Firebase</p><p className="mt-2 break-all">Conta conectada: {firebaseUser.email || "(sem e-mail)"}</p><p className="mt-1 break-all">E-mail reconhecido no token: {accessAuthInfo.tokenEmail}</p><p className="mt-1">Projeto: {accessAuthInfo.projectId}</p><p className="mt-1 break-all">Banco: {accessAuthInfo.databaseURL}</p><p className="mt-2 text-slate-400">O token é atualizado automaticamente antes da leitura. Nenhuma chave ou token privado é exibido.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metric('Visitas registradas',siteAccessEvents.length,MousePointerClick)}{metric('Navegadores diferentes',new Set(siteAccessEvents.map(x=>x.visitorId).filter(Boolean)).size,Users,'text-emerald-300','Não equivale necessariamente a pessoas únicas')}{metric('Primeiras visitas',siteAccessEvents.filter(x=>x.visitType==='new').length,UserRound,'text-cyan-300')}{metric('Visitas de retorno',siteAccessEvents.filter(x=>x.visitType==='returning').length,RefreshCw,'text-violet-300')}</div><section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80"><div className="border-b border-white/10 p-4"><h3 className="font-bold">Atividade recente</h3><p className="mt-1 text-xs text-slate-300">Últimas 100 visitas, com horário, tipo e origem quando disponível.</p></div><div className="max-h-[650px] overflow-y-auto">{siteAccessEvents.length===0?<p className="p-8 text-center text-sm text-slate-300">Ainda não há visitas registradas. Abra o site em uma nova aba para testar.</p>:siteAccessEvents.slice(0,100).map(item=><div key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 p-4 text-sm"><div><p className="font-semibold">{item.visitType==='returning'?'Visitante recorrente':'Primeira visita neste navegador'}</p><p className="mt-1 text-xs text-slate-300">ID do navegador: {String(item.visitorId||'').slice(0,12)}… · Página: {item.path||'/'}</p><p className="mt-1 text-[11px] text-slate-400">Origem: {item.referrer||'Acesso direto ou origem não informada'}</p></div><span className="text-xs text-slate-300">{date(item.createdAt)}</span></div>)}</div></section><p className="text-xs leading-relaxed text-slate-400">Limitação: a contagem identifica navegadores que mantêm o armazenamento local. A mesma pessoa pode aparecer como visitante diferente em outro aparelho ou navegador; limpar os dados também cria um novo identificador. Não são coletados IP, nome ou e-mail nesta medição.</p></>:null}
        {section==='reports'?<><div><h2 className="text-2xl font-black">Relatórios</h2><p className="mt-1 text-sm text-slate-200">Resumo financeiro dos registros existentes.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metric('Depósitos registrados',visibleDeposits.length,ArrowDownToLine)}{metric('Depósitos confirmados',money(depositTotal),CircleDollarSign,'text-emerald-300')}{metric('Saques registrados',withdrawals.length,ArrowUpFromLine)}{metric('Saques pagos',money(paidWithdrawals),CircleDollarSign,'text-cyan-300')}</div><div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5"><h3 className="font-bold">Últimas movimentações</h3>{[...visibleDeposits.map(x=>({...x,_kind:'Depósito'})),...withdrawals.map(x=>({...x,_kind:'Saque'}))].sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0)).slice(0,20).map(x=><div key={x._kind+x.id} className="flex items-center justify-between gap-3 border-b border-white/5 py-3 text-sm"><div><p className="font-semibold">{x._kind} · {x.email||x.uid||'Cliente'}</p><p className="text-xs text-slate-300">{date(x.createdAt)}</p></div><div className="text-right"><p className="font-bold">{money(x.amount)}</p><p className="text-[10px] text-slate-200">{statusLabel(x.status)}</p></div></div>)}</div></>:null}
        {section==='support'?<><div><h2 className="text-2xl font-black">Central de Suporte</h2><p className="mt-1 text-sm text-slate-200">Converse com os clientes em tempo real. Selecione uma conversa para responder.</p></div><div className="grid min-h-[620px] gap-4 lg:grid-cols-[minmax(260px,.75fr)_minmax(0,1.5fr)]"><section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80"><div className="border-b border-white/10 p-4"><div className="flex items-center gap-2 font-bold"><MessageCircle className="text-cyan-300" size={18}/> Conversas recebidas</div><p className="mt-1 text-[11px] text-slate-300">{supportThreads.length} cliente(s) no suporte</p></div><div className="max-h-[560px] overflow-y-auto">{supportThreads.length===0?<p className="p-6 text-center text-sm text-slate-300">Nenhuma conversa iniciada ainda.</p>:supportThreads.map(thread=>{const last=thread.messages.at(-1);return <button key={thread.uid} onClick={()=>setSelectedSupportUid(thread.uid)} className={'w-full border-b border-white/5 p-4 text-left hover:bg-white/5 '+(selectedSupportUid===thread.uid?'bg-cyan-400/10':'')}><p className="truncate text-sm font-bold">{thread.profile.displayName||last?.senderName||'Cliente'}</p><p className="mt-1 truncate text-[11px] text-slate-300">{last?.text||thread.profile.email||thread.uid}</p><p className="mt-1 truncate text-[10px] text-slate-400">{thread.profile.email||thread.uid}</p></button>})}</div></section><section className="flex min-h-[560px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80">{!selectedSupportUid?<div className="grid flex-1 place-items-center p-8 text-center text-slate-300"><div><Headset className="mx-auto mb-3 text-cyan-300" size={42}/><p>Escolha um cliente na lista para abrir o atendimento.</p></div></div>:<><div className="border-b border-white/10 p-4"><p className="font-bold">{supportThreads.find(x=>x.uid===selectedSupportUid)?.profile.displayName||'Cliente NEXUS'}</p><p className="mt-1 break-all text-[11px] text-slate-300">{supportThreads.find(x=>x.uid===selectedSupportUid)?.profile.email||selectedSupportUid}</p></div><div className="flex-1 space-y-3 overflow-y-auto p-4">{supportMessages.length===0?<p className="py-10 text-center text-sm text-slate-300">Envie uma mensagem para iniciar o atendimento.</p>:supportMessages.map(msg=><div key={msg.id} className={'flex '+(msg.senderRole==='admin'?'justify-end':'justify-start')}><div className={'max-w-[85%] rounded-2xl px-3 py-2.5 '+(msg.senderRole==='admin'?'bg-cyan-400 text-slate-950':'bg-slate-800 text-white')}><p className="mb-1 text-[10px] font-bold opacity-70">{msg.senderRole==='admin'?'Você · Suporte':'Cliente'}</p><p className="whitespace-pre-wrap break-words text-sm">{msg.text}</p><p className="mt-1 text-right text-[9px] opacity-60">{date(msg.createdAt)}</p></div></div>)}</div><form onSubmit={sendSupportReply} className="flex items-end gap-2 border-t border-white/10 p-3"><textarea value={supportReply} onChange={e=>setSupportReply(e.target.value)} rows={2} maxLength={2000} placeholder="Digite sua resposta ao cliente..." className="min-w-0 flex-1 resize-none rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-white outline-none focus:border-cyan-400" required/><button disabled={supportBusy||!supportReply.trim()} className="flex shrink-0 items-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950 disabled:opacity-40"><Send size={16}/><span className="hidden sm:inline">{supportBusy?'Enviando...':'Enviar'}</span></button></form></>}</section></div></>:null}
        {section==='settings'?<><div><h2 className="text-2xl font-black">Configurações</h2><p className="mt-1 text-sm text-slate-200">Informações e estado de acesso do painel.</p></div><div className="max-w-2xl space-y-3 rounded-2xl border border-white/10 bg-slate-900/80 p-5"><div className="flex items-center gap-3"><ShieldCheck className="text-emerald-300" size={24}/><div><p className="font-bold">Conta administrativa reconhecida</p><p className="text-xs text-slate-200">{firebaseUser.email}</p></div></div><div className="border-t border-white/10 pt-3 text-sm text-slate-200">Projeto Firebase conectado: Realtime Database. As permissões efetivas dependem das regras publicadas no console do Firebase.</div><button onClick={()=>window.location.href='https://console.firebase.google.com/project/nexus-acoes/database/nexus-acoes-default-rtdb/data'} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/5">Abrir Firebase Console <ExternalLink className="ml-1 inline" size={14}/></button></div></>:null}
        <footer className="border-t border-white/10 pt-4 text-center text-[11px] text-slate-300">NEXUS AÇÕES · Painel administrativo · Ações financeiras registradas exigem conferência bancária.</footer>
      </div>
    </div>
  </main>;
}
