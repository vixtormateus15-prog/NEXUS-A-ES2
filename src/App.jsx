import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { get, onValue, ref, runTransaction, set, update } from 'firebase/database';
import { auth, database, firebaseConfigured, functions } from './firebase';
import { httpsCallable } from 'firebase/functions';
import AuthScreen from './AuthScreen.jsx';
import AdminPanel from './AdminPanel.jsx';
import {
  Menu,
  Bell,
  User,
  Home,
  TrendingUp,
  Wallet,
  Users,
  Copy,
  Check,
  Crown,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Award,
  BookOpen,
  CreditCard,
  History,
  Lock,
  Sparkles,
  X,
  Share2,
  QrCode,
  Search,
  CheckCircle2,
  Clock,
  Zap,
  Info,
  Building2,
  Cpu,
  Wheat,
  Factory,
  Bolt,
  Coins,
  Globe,
  Gem,
  AlertTriangle,
  ExternalLink,
  Ticket
} from 'lucide-react';

// ============================================================================
// DADOS E CONFIGURAÇÕES INICIAIS DA PLATAFORMA NEXUS AÇÕES
// ============================================================================

const INITIAL_PLANS = [
  {
    id: 'nexus-start',
    name: 'NEXUS START',
    image: '/plans/nexus-start.svg',
    dailyReturn: 4.50,
    days: 23,
    limit: 1,
    bought: 0,
    price: 35.00,
    tag: '1 compra por conta',
    gradient: 'from-blue-900 via-indigo-800 to-cyan-700',
    accent: 'text-cyan-300',
    icon: Building2,
    subtitle: 'Fundo Imobiliário & Renda Fixa',
    badge: 'INICIANTE'
  },
  {
    id: 'nexus-tech',
    name: 'NEXUS TECH',
    image: '/plans/nexus-tech.svg',
    dailyReturn: 17.50,
    days: 17,
    limit: 1,
    bought: 0,
    price: 100.00,
    tag: '1 compra por conta',
    gradient: 'from-slate-900 via-blue-900 to-indigo-700',
    accent: 'text-blue-300',
    icon: Cpu,
    subtitle: 'Semicondutores & Inteligência Artificial',
    badge: 'TECNOLOGIA'
  },
  {
    id: 'nexus-agro',
    name: 'NEXUS AGRO',
    image: '/plans/nexus-agro.svg',
    dailyReturn: 38.50,
    days: 16,
    limit: 3,
    bought: 0,
    price: 200.00,
    tag: 'Até 3 compras por conta',
    gradient: 'from-blue-950 via-teal-900 to-emerald-800',
    accent: 'text-emerald-300',
    icon: Wheat,
    subtitle: 'Exportação & Agronegócio Sustentável',
    badge: 'AGROTECH'
  },
  {
    id: 'nexus-industrial',
    name: 'NEXUS INDUSTRIAL',
    image: '/plans/nexus-industrial.svg',
    dailyReturn: 60.50,
    days: 15,
    limit: 2,
    bought: 0,
    price: 300.00,
    tag: 'Até 2 compras por conta',
    gradient: 'from-slate-900 via-slate-800 to-blue-900',
    accent: 'text-amber-300',
    icon: Factory,
    subtitle: 'Infraestrutura & Logística Pesada',
    badge: 'INDÚSTRIA'
  },
  {
    id: 'nexus-energy',
    name: 'NEXUS ENERGY',
    image: '/plans/nexus-energy.svg',
    dailyReturn: 127.50,
    days: 9,
    limit: 1,
    bought: 0,
    price: 600.00,
    tag: '1 compra por conta',
    gradient: 'from-indigo-950 via-blue-900 to-amber-700',
    accent: 'text-amber-300',
    icon: Bolt,
    subtitle: 'Energia Limpa & Matriz Solar Global',
    badge: 'ENERGIA'
  },
  {
    id: 'nexus-crypto',
    name: 'NEXUS CRYPTO',
    image: '/plans/nexus-crypto.svg',
    dailyReturn: 212.75,
    days: 9,
    limit: 2,
    bought: 0,
    price: 1000.00,
    tag: 'Até 2 compras por conta',
    gradient: 'from-slate-950 via-indigo-950 to-purple-900',
    accent: 'text-purple-300',
    icon: Coins,
    subtitle: 'Ativos Digitais & Liquidez Institucional',
    badge: 'BLOCKCHAIN'
  },
  {
    id: 'nexus-global',
    name: 'NEXUS GLOBAL',
    image: '/plans/nexus-global.svg',
    dailyReturn: 453.28,
    days: 11,
    limit: 2,
    bought: 0,
    price: 2500.00,
    tag: 'Até 2 compras por conta',
    gradient: 'from-blue-950 via-indigo-900 to-cyan-800',
    accent: 'text-cyan-300',
    icon: Globe,
    subtitle: 'Índices Internacionais & Câmbio',
    badge: 'GLOBAL'
  },
  {
    id: 'nexus-prime',
    name: 'NEXUS PRIME',
    image: '/plans/nexus-prime.svg',
    dailyReturn: 817.36,
    days: 12,
    limit: 2,
    bought: 0,
    price: 5000.00,
    tag: 'Até 2 compras por conta',
    gradient: 'from-slate-950 via-amber-950 to-yellow-800',
    accent: 'text-amber-300',
    icon: Gem,
    subtitle: 'Private Banking & Alta Frequência',
    badge: 'EXCLUSIVE'
  }
];

const INITIAL_BADGES = [
  { id: 1, title: 'Conta aberta', desc: 'Entrou na plataforma.', reward: '0,50 de pontos Nexus - já na conta', completed: true },
  { id: 2, title: 'Primeiro depósito', desc: 'Fez um depósito pago.', reward: 'R$ 1,00 em saldo de depósito', completed: false },
  { id: 3, title: 'Primeiro investimento', desc: 'Comprou um produto.', reward: '0,40 de pontos Nexus', completed: false },
  { id: 4, title: 'Coletor', desc: 'Resgatou um rendimento.', reward: '0,55 de pontos Nexus', completed: false },
  { id: 5, title: 'Constância', desc: 'Resgatou rendimento 7 vezes.', reward: '1,20 em comissão', completed: false },
  { id: 6, title: 'Primeiro indicado', desc: 'Alguém entrou pelo seu código.', reward: '0,65 de pontos Nexus', completed: false },
  { id: 7, title: 'Rede de 5', desc: 'Cinco pessoas na indicação direta.', reward: '0,90 de pontos Nexus', completed: false },
  { id: 8, title: 'Indicado ativo', desc: 'Um indicado já investiu.', reward: '1,90 em comissão', completed: false },
  { id: 9, title: 'Membro VIP', desc: 'Alcançou um nível VIP.', reward: 'R$ 10,00 em saldo de depósito', completed: false },
  { id: 10, title: 'Afiliado II', desc: 'Chegou ao nível B da equipe.', reward: '0,70 em comissão', completed: false },
];

const VIP_LEVELS = [
  { level: 'VIP 1', recharge: 'R$ 300,00', team: 3, bonus: 'R$ 15,00' },
  { level: 'VIP 2', recharge: 'R$ 1.000,00', team: 10, bonus: 'R$ 55,00' },
  { level: 'VIP 3', recharge: 'R$ 4.000,00', team: 40, bonus: 'R$ 220,00' },
  { level: 'VIP 4', recharge: 'R$ 10.000,00', team: 100, bonus: 'R$ 600,00' },
  { level: 'VIP 5', recharge: 'R$ 25.000,00', team: 250, bonus: 'R$ 1.800,00' },
];

const PLATFORM_GUIDE_STEPS = [
  {
    step: 1,
    title: 'Visão Geral da Conta',
    desc: 'No topo da tela inicial você acompanha seu Saldo de Depósito, Saldo Disponível para Saque, Pontos Nexus e Remuneração de equipe em tempo real.',
    highlight: 'Painel Financeiro Centralizado'
  },
  {
    step: 2,
    title: 'Atalhos da Tela Inicial',
    desc: 'Use os botões rápidos abaixo do Clube VIP para Depositar via PIX, Solicitar Saque, conferir seu nível VIP ou gerenciar sua Equipe.',
    highlight: 'Acesso Rápido em 1 Toque'
  },
  {
    step: 3,
    title: 'Como Comprar um Plano de Ações',
    desc: 'Escolha um plano na vitrine (ex: NEXUS START), confira o rendimento diário e o ciclo em dias. Ao confirmar, o valor é debitado do seu Saldo.',
    highlight: 'Planos a partir de R$ 35,00'
  },
  {
    step: 4,
    title: 'Como Adicionar Saldo (PIX)',
    desc: 'Toque no botão central "Depositar", escolha um valor rápido ou digite entre R$ 35,00 e R$ 5.000,00 e consulte as condições de crédito disponíveis.',
    highlight: 'Compensação Automática'
  },
  {
    step: 5,
    title: 'Onde Ficam os Planos Ativos',
    desc: 'Acesse a aba "Investir" no menu inferior e selecione "Iniciado" para acompanhar o progresso diário e o tempo restante de cada cota.',
    highlight: 'Monitoramento em Tempo Real'
  },
  {
    step: 6,
    title: 'Como Coletar o Rendimento',
    desc: 'A cada 24 horas o ciclo diário é concluído. Toque em "Acelerar rendimento / Injetar Pontos" para liberar o lucro direto para seu saldo de saque.',
    highlight: 'Liquidez Diária'
  },
  {
    step: 7,
    title: 'Como Usar os Pontos Nexus',
    desc: 'Os Pontos Nexus aceleram a liberação dos seus dividendos diários. Você ganha pontos ao abrir conta, investir, coletar e indicar amigos.',
    highlight: 'Energia de Rendimento'
  },
  {
    step: 8,
    title: 'Como Sacar seu Dinheiro',
    desc: 'Vá em "Retirada", cadastre sua chave PIX (CPF, Telefone, E-mail ou Aleatória) e informe o valor a partir de R$ 10,00. Taxa operacional de 5%.',
    highlight: 'Saque Rápido via PIX'
  },
  {
    step: 9,
    title: 'Programa de Indicação (Equipe)',
    desc: 'Compartilhe seu código exclusivo ou link de convite na aba "Equipe". Ganhe 7% no Nível A (diretos) e 3% no Nível B (indiretos).',
    highlight: 'Comissões em 2 Níveis'
  },
  {
    step: 10,
    title: 'Clube VIP e Recompensas',
    desc: 'Ao atingir as metas de recarga pessoal e equipe ativa, você sobe de nível VIP e desbloqueia salários diários e bônus exclusivos.',
    highlight: 'Crescimento Progressivo'
  },
  {
    step: 11,
    title: 'Sistema de Insígnias',
    desc: 'Complete missões simples no aplicativo para desbloquear insígnias que concedem saldo extra e Pontos Nexus gratuitamente.',
    highlight: 'Gamificação Lucrativa'
  },
  {
    step: 12,
    title: 'Segurança e Suporte Oficial',
    desc: 'Mantenha sua senha atualizada na aba Perfil e acompanhe os comunicados oficiais no grupo do Telegram da NEXUS AÇÕES.',
    highlight: 'Proteção de Conta'
  }
];

// Formatador de moeda BRL
const formatBRL = (value) => {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

// Início do dia e contagem regressiva usando o fuso oficial de Brasília.
const getBrazilDayStart = (timestamp = Date.now()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date(timestamp));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), 3, 0, 0);
};

const formatCountdown = (milliseconds) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

// ============================================================================
// COMPONENTE DE BANNER VISUAL TEMÁTICO DOS PLANOS (SVG + CSS CORPORATIVO)
// ============================================================================
const PlanVisualBanner = ({ plan, heightClass = 'h-40' }) => {
  const IconComponent = plan.icon;
  return (
    <div className={`plan-banner relative w-full ${heightClass} bg-gradient-to-br ${plan.gradient} overflow-hidden flex items-center justify-between p-5 select-none`}>
      <img src={plan.image} alt={`Imagem ilustrativa de ${plan.subtitle}`} className="plan-banner-image absolute inset-0 w-full h-full object-cover" loading="lazy" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-slate-950/90 via-slate-950/55 to-slate-950/25" />
      <div className="plan-banner-glow absolute z-[2] -right-10 -top-12 w-44 h-44 rounded-full bg-cyan-300/25 blur-3xl" />
      {/* Padrão geométrico de gráfico financeiro no fundo */}
      <svg className="absolute z-[3] inset-0 w-full h-full opacity-20" viewBox="0 0 400 160" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${plan.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,130 L45,115 L90,122 L140,85 L195,95 L250,55 L310,65 L360,25 L400,15 L400,160 L0,160 Z"
          fill={`url(#grad-${plan.id})`}
        />
        <path
          d="M0,130 L45,115 L90,122 L140,85 L195,95 L250,55 L310,65 L360,25 L400,15"
          fill="none"
          stroke="#7dd3fc"
          strokeWidth="2.5"
        />
        {/* Grid lines */}
        <line x1="0" y1="40" x2="400" y2="40" stroke="white" strokeOpacity="0.15" strokeDasharray="4 4" />
        <line x1="0" y1="80" x2="400" y2="80" stroke="white" strokeOpacity="0.15" strokeDasharray="4 4" />
        <line x1="0" y1="120" x2="400" y2="120" stroke="white" strokeOpacity="0.15" strokeDasharray="4 4" />
      </svg>

      {/* Lado Esquerdo: Branding NEXUS AÇÕES */}
      <div className="relative z-10 flex flex-col justify-between h-full max-w-[65%]">
        <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full w-fit">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] font-bold tracking-wider text-white uppercase">{plan.badge}</span>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-extrabold tracking-widest text-amber-300 uppercase">NEXUS AÇÕES</span>
          </div>
          <h4 className="text-white font-bold text-lg leading-tight drop-shadow">{plan.name}</h4>
          <p className="text-slate-200/90 text-[11px] mt-0.5 line-clamp-1">{plan.subtitle}</p>
        </div>
      </div>

      {/* Lado Direito: Terminal/Cartão 3D Estilizado */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div className="w-20 h-24 rounded-2xl bg-slate-950/60 backdrop-blur-md border border-white/20 shadow-2xl flex flex-col items-center justify-between p-2.5 transform rotate-3">
          <div className="w-full flex items-center justify-between">
            <span className="text-[8px] font-bold text-cyan-300">NX-IDX</span>
            <span className="text-[8px] font-extrabold text-emerald-300">+{((plan.dailyReturn * plan.days / plan.price) * 100).toFixed(1).replace('.', ',')}%</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg">
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <div className="w-full text-center border-t border-white/10 pt-1">
            <span className="text-[9px] font-extrabold text-white tracking-wider">NEXUS</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL DA APLICAÇÃO
// ============================================================================
function Dashboard({ firebaseUser, onSignOut }) {
  // Estados de Navegação
  const [activeTab, setActiveTab] = useState('inicio'); // inicio, investir, depositar, equipe, perfil
  const [subPage, setSubPage] = useState(null); // null, plan-detail, vip, course, pix-method, badges, coupons, deposit-records, withdraw-records, change-password, withdraw, vip-intro, points-intro
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [investSubTab, setInvestSubTab] = useState('investir'); // investir, iniciado, encerrados

  // Modais & Drawers
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showNotices, setShowNotices] = useState(true);
  const [pixModalData, setPixModalData] = useState(null); // { amount, code }
  const [pendingDepositRequest, setPendingDepositRequest] = useState(null);

  // Toast Notification
  const [toast, setToast] = useState(null);
  const [checkinBusy, setCheckinBusy] = useState(false);
  const [investmentBusy, setInvestmentBusy] = useState(false);
  const [checkinClock, setCheckinClock] = useState(Date.now());
  const [walletData, setWalletData] = useState({ withdrawableBalance: 0, lastCheckinAt: null, checkinCount: 0, signupBonusGranted: false });
  const checkinDayStart = getBrazilDayStart(checkinClock);
  const checkinDoneToday = Number(walletData.lastCheckinAt || 0) >= checkinDayStart;
  const checkinCountdown = formatCountdown(checkinDayStart + 86400000 - checkinClock);

  useEffect(() => {
    const timer = setInterval(() => setCheckinClock(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Estado Financeiro e do Usuário
  const [user, setUser] = useState({
    id: String(firebaseUser.uid).slice(-10),
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    vipLevel: 0,
    depositBalance: 0.00,
    withdrawableBalance: 0.00,
    nexusPoints: 0.00,
    commissionBalance: 0.00,
    inviteCode: '',
    pixKeyType: 'CPF',
    pixKey: '',
  });

  // Planos e Investimentos Ativos
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [activeInvestments, setActiveInvestments] = useState([]);
  const [completedInvestments, setCompletedInvestments] = useState([]);

  // Histórico e Conquistas
  const [badges, setBadges] = useState(INITIAL_BADGES);
  const [depositHistory, setDepositHistory] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const knownDepositHistoryIds = useRef(null);
  const [couponLogs, setCouponLogs] = useState([
    {
      id: 1,
      title: 'Insígnia Conta aberta',
      date: '26/11/2026, 13:44:26 - Pontos Nexus',
      amount: '+ 0,50 pontos',
      balanceAfter: 'Saldo: 0,50'
    }
  ]);

  // Estados de Formulários
  const [depositAmount, setDepositAmount] = useState('50');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [tempPixType, setTempPixType] = useState('CPF');
  const [tempPixKey, setTempPixKey] = useState('');
  const [withdrawCpf, setWithdrawCpf] = useState('');
  const [withdrawHolderName, setWithdrawHolderName] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [teamSearch, setTeamSearch] = useState('');
  const [guideStepIndex, setGuideStepIndex] = useState(0);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

  // Cria e carrega somente o perfil básico vinculado ao UID autenticado.
  // Saldos, investimentos e pagamentos não são gravados pelo navegador.
  useEffect(() => {
    if (!database || !firebaseUser?.uid) return undefined;
    let active = true;
    const profileRef = ref(database, `profiles/${firebaseUser.uid}`);
    get(profileRef)
      .then(async (snapshot) => {
        if (!active) return;
        if (!snapshot.exists()) {
          await set(profileRef, {
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || (firebaseUser.email || '').split('@')[0],
            createdAt: Date.now()
          });
        } else {
          const profile = snapshot.val() || {};
          setUser((prev) => ({
            ...prev,
            email: profile.email || firebaseUser.email || '',
            id: profile.displayName || prev.id
          }));
        }
      })
      .catch(() => {
        if (active) showProfileError();
      });
    return () => { active = false; };
  }, [firebaseUser.uid]);

  // Mantém o pedido pendente recuperável mesmo quando o cliente fecha a janela ou atualiza o site.
  useEffect(() => {
    if (!database || !firebaseUser?.uid) return undefined;
    return onValue(ref(database, 'depositRequestsByUser/' + firebaseUser.uid), (snapshot) => {
      const raw = snapshot.val() || {};
      const pending = Object.entries(raw)
        .map(([id, request]) => ({ id, ...(request || {}) }))
        .filter((request) => request.status === 'pending' || request.status === 'awaiting_payment')
        .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0))[0] || null;
      setPendingDepositRequest(pending);
      if (pending) {
        setPixModalData((current) => current?.requestId === pending.id
          ? { ...current, amount: Number(pending.amount || 0), code: pending.pixCopyPaste || '', status: pending.status }
          : current);
      }
    }, (error) => {
      console.error('Falha ao recuperar pedido pendente de depósito:', error);
    });
  }, [firebaseUser.uid]);

  // Recebe em tempo real o código PIX que o administrador disponibilizar no painel.
  useEffect(() => {
    if (!database || !pixModalData?.requestId) return undefined;
    // O cliente acompanha o próprio espelho do pedido, cuja leitura é autorizada
    // pelas regras em depositRequestsByUser/{uid}.
    return onValue(ref(database, 'depositRequestsByUser/' + firebaseUser.uid + '/' + pixModalData.requestId), (snapshot) => {
      if (!snapshot.exists()) return;
      const request = snapshot.val() || {};
      setPixModalData((current) => current?.requestId === pixModalData.requestId
        ? { ...current, code: request.pixCopyPaste || '', status: request.status || 'pending' }
        : current);
    }, (error) => {
      console.error('Falha ao acompanhar pedido PIX:', error);
      showToast('Pedido criado, mas não foi possível acompanhar o PIX: ' + (error?.code || error?.message || 'erro de leitura'), 'error');
    });
  }, [pixModalData?.requestId]);

  // Histórico de depósitos confirmado pelo painel administrativo.
  useEffect(() => {
    if (!database || !firebaseUser?.uid) return undefined;
    return onValue(ref(database, `depositHistory/${firebaseUser.uid}`), (snapshot) => {
      const raw = snapshot.val() || {};
      const history = Object.entries(raw).map(([id, item]) => ({
        id,
        amount: Number(item?.amount || 0),
        status: 'Pago',
        confirmedAt: Number(item?.confirmedAt || 0),
        date: item?.confirmedAt ? new Date(Number(item.confirmedAt)).toLocaleString('pt-BR') : '—',
        transactionId: item?.transactionId || ''
      })).sort((a, b) => b.confirmedAt - a.confirmedAt);
      const currentIds = new Set(history.map((item) => item.id));
      if (knownDepositHistoryIds.current !== null) {
        const newlyConfirmed = history.find((item) => !knownDepositHistoryIds.current.has(item.id));
        if (newlyConfirmed) {
          showToast(`Depósito de ${formatBRL(newlyConfirmed.amount)} concluído com sucesso!`, 'success');
        }
      }
      knownDepositHistoryIds.current = currentIds;
      setDepositHistory(history);
    }, (error) => {
      console.error('Falha ao carregar histórico de depósitos:', error);
    });
  }, [firebaseUser.uid]);

  useEffect(() => {
    if (pixModalData?.status !== 'paid') return undefined;
    const timer = setTimeout(() => {
      setPixModalData((current) => current?.requestId === pixModalData.requestId ? null : current);
    }, 3500);
    return () => clearTimeout(timer);
  }, [pixModalData?.status, pixModalData?.requestId]);

  // Mantém a carteira sincronizada em tempo real com os créditos do servidor.
  useEffect(() => {
    if (!database || !firebaseUser?.uid) return undefined;
    const walletRef = ref(database, `wallets/${firebaseUser.uid}`);
    return onValue(walletRef, (snapshot) => {
      const wallet = snapshot.exists()
        ? (snapshot.val() || {})
        : { withdrawableBalance: 0, lastCheckinAt: null, checkinCount: 0, signupBonusGranted: false };
      setWalletData(wallet);
      setUser((prev) => ({
        ...prev,
        withdrawableBalance: Number(wallet.withdrawableBalance || 0),
        depositBalance: Number(wallet.depositBalance || 0)
      }));
    }, () => {
      showToast('Não foi possível carregar sua carteira de recompensas.', 'error');
    });
  }, [firebaseUser.uid]);

  // Investimentos são carregados da carteira persistida e só podem ser criados pelo backend.
  useEffect(() => {
    const raw = walletData.investments || {};
    const all = Object.values(raw).filter((item) => item && item.instanceId);
    const now = checkinClock;
    const active = all.filter((item) => now < Number(item.firstCreditAt || 0) + Number(item.days || 0) * 86400000);
    const completed = all.filter((item) => now >= Number(item.firstCreditAt || 0) + Number(item.days || 0) * 86400000);
    setActiveInvestments(active.sort((a, b) => Number(b.startAt || 0) - Number(a.startAt || 0)));
    setCompletedInvestments(completed.sort((a, b) => Number(b.startAt || 0) - Number(a.startAt || 0)));
    setPlans(INITIAL_PLANS.map((plan) => ({ ...plan, bought: all.filter((item) => item.planId === plan.id).length })));
  }, [walletData.investments, checkinClock]);

  const showProfileError = () => {
    setToast({ message: 'Não foi possível carregar seu perfil. Confira as regras do Realtime Database.', type: 'error' });
  };

  // Helper de Toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // Copiar para área de transferência com fallback
  const handleCopy = (text, label = 'Copiado') => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    showToast(`${label}: ${text}`, 'success');
  };

  // Navegação limpa entre abas principais
  const navigateToTab = (tab) => {
    setActiveTab(tab);
    setSubPage(null);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Abrir detalhes de um plano
  const openPlanDetails = (plan) => {
    setSelectedPlan(plan);
    setSubPage('plan-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Ativação financeira executada no servidor; o navegador nunca debita a carteira.
  const handleInvestPlan = async (plan) => {
    if (!functions || investmentBusy) {
      showToast('Serviço de ativação indisponível. Tente novamente mais tarde.', 'error');
      return;
    }
    if (Number(user.depositBalance || 0) < Number(plan.price || 0)) {
      showToast('Saldo insuficiente. Faça um depósito e aguarde a confirmação no painel.', 'warning');
      setSubPage(null);
      setActiveTab('depositar');
      setDepositAmount(String(plan.price));
      return;
    }
    setInvestmentBusy(true);
    try {
      const activate = httpsCallable(functions, 'activateInvestment');
      const activationKey = `${firebaseUser.uid.slice(0, 8)}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      await activate({ planId: plan.id, activationKey });
      showToast(`Plano ${plan.name} ativado. O primeiro dia do ciclo começa às 00:00 de Brasília.`, 'success');
      setSubPage(null);
      setActiveTab('investir');
      setInvestSubTab('iniciado');
    } catch (error) {
      const messages = {
        'functions/failed-precondition': error.message || 'Não foi possível ativar o plano.',
        'functions/unauthenticated': 'Entre novamente na sua conta.',
        'functions/unavailable': 'O serviço está temporariamente indisponível.'
      };
      showToast(messages[error?.code] || error?.message || 'Falha ao ativar o plano.', 'error');
    } finally {
      setInvestmentBusy(false);
    }
  };

  // O servidor libera um check-in por dia no fuso de Brasília.
  const handleDailyCheckin = async () => {
    if (!database || !firebaseUser?.uid || checkinBusy) return;
    setCheckinBusy(true);
    try {
      const walletRef = ref(database, `wallets/${firebaseUser.uid}`);
      const result = await runTransaction(walletRef, (current) => {
        const wallet = current || {};
        const lastCheckinAt = Number(wallet.lastCheckinAt || 0);
        if (lastCheckinAt >= getBrazilDayStart(Date.now())) return;
        return {
          ...wallet,
          withdrawableBalance: Number((Number(wallet.withdrawableBalance || 0) + 1).toFixed(2)),
          checkinCount: Number(wallet.checkinCount || 0) + 1,
          lastCheckinAt: Date.now()
        };
      }, { applyLocally: false });

      if (!result.committed) {
        showToast('Seu check-in de hoje já foi realizado. O botão será liberado à meia-noite.', 'info');
        return;
      }
      const wallet = result.snapshot.val() || {};
      setWalletData(wallet);
      setUser((prev) => ({ ...prev, withdrawableBalance: Number(wallet.withdrawableBalance || 0) }));
      showToast('Check-in confirmado! R$ 1,00 foi adicionado ao saldo interno.', 'success');
    } catch (error) {
      showToast('Não foi possível concluir o check-in. Aguarde e tente novamente.', 'error');
    } finally {
      setCheckinBusy(false);
    }
  };

  // Solicita um PIX: o administrador cola o código verdadeiro gerado no banco.
  const handleGeneratePix = async () => {
    const val = Number(String(depositAmount).replace(',', '.'));
    if (!Number.isFinite(val) || val < 35 || val > 5000) {
      showToast('Informe um valor entre R$ 35,00 e R$ 5.000,00.', 'error');
      return;
    }
    if (!database || !firebaseUser?.uid) {
      showToast('Não foi possível conectar ao sistema de depósitos.', 'error');
      return;
    }
    try {
      const requestId = firebaseUser.uid + '_' + Date.now();
      const requestData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: user.id || '',
        amount: Number(val.toFixed(2)),
        status: 'pending',
        createdAt: Date.now()
      };
      await update(ref(database), {
        ['depositRequests/' + requestId]: requestData,
        ['depositRequestsByUser/' + firebaseUser.uid + '/' + requestId]: requestData
      });
      const newRequest = { id: requestId, amount: val, code: '', status: 'pending' };
      setPendingDepositRequest(newRequest);
      setPixModalData({ amount: val, requestId, code: '', status: 'pending' });
      showToast('Pedido enviado. Aguarde o código PIX ser disponibilizado.', 'success');
    } catch (error) {
      console.error('Falha ao criar pedido de depósito:', error);
      showToast('Falha ao criar depósito (' + (error?.code || error?.message || 'erro desconhecido') + '). Verifique sua conexão e as regras do Firebase.', 'error');
    }
  };

  // O cliente apenas fecha o modal; não pode simular confirmação de pagamento.
  const handleConfirmPixSimulation = () => {
    setPixModalData(null);
    showToast('Aguarde a confirmação do depósito após a conferência bancária.', 'info');
    return;
    if (!pixModalData) return;
    const val = pixModalData.amount;
    const isFirstDeposit = depositHistory.length === 0;
    const bonus = isFirstDeposit ? 1.00 : 0;

    setUser((prev) => ({
      ...prev,
      depositBalance: Number((prev.depositBalance + val + bonus).toFixed(2))
    }));

    setDepositHistory((prev) => [
      {
        id: `DEP-${Date.now().toString().slice(-6)}`,
        amount: val,
        status: 'Pago',
        date: new Date().toLocaleString('pt-BR')
      },
      ...prev
    ]);

    if (isFirstDeposit) {
      setBadges((prev) =>
        prev.map((b) => (b.id === 2 ? { ...b, completed: true } : b))
      );
    }

    setPixModalData(null);
    showToast(
      isFirstDeposit
        ? `Depósito de ${formatBRL(val)} + R$ 1,00 de bônus confirmados!`
        : `Depósito de ${formatBRL(val)} confirmado com sucesso!`,
      'success'
    );
  };

  // Salvar Chave PIX
  const handleSavePixKey = (e) => {
    e.preventDefault();
    if (!tempPixKey.trim()) {
      showToast('Digite uma chave PIX válida.', 'error');
      return;
    }
    setUser((prev) => ({
      ...prev,
      pixKeyType: tempPixType,
      pixKey: tempPixKey.trim()
    }));
    showToast('Chave PIX salva com sucesso!', 'success');
    setSubPage('withdraw');
  };

  // Solicitar Saque
  const handleRequestWithdraw = () => {
    if (activeInvestments.length === 0) {
      showToast('Ative pelo menos um plano para liberar o saque dos bônus e check-ins.', 'warning');
      return;
    }

    const val = Number(String(withdrawAmount).replace(',', '.'));
    if (!Number.isFinite(val) || val < 10) {
      showToast('O valor mínimo para saque é de R$ 10,00.', 'error');
      return;
    }
    if (val > Number(user.withdrawableBalance || 0)) {
      showToast('Saldo disponível para retirada insuficiente.', 'error');
      return;
    }
    const cpfDigits = withdrawCpf.replace(/\D/g, '');
    if (cpfDigits.length !== 11) {
      showToast('Informe um CPF válido com 11 números.', 'error');
      return;
    }
    if (!withdrawHolderName.trim()) {
      showToast('Informe o nome completo do titular da conta bancária.', 'error');
      return;
    }
    const pixKey = tempPixKey.trim();
    if (!pixKey) {
      showToast('Informe a chave PIX que receberá o saque.', 'error');
      return;
    }
    if (tempPixType === 'CPF' && pixKey.replace(/\D/g, '').length !== 11) {
      showToast('A chave PIX CPF deve conter 11 números.', 'error');
      return;
    }
    if (tempPixType === 'E-mail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pixKey)) {
      showToast('Informe um e-mail válido como chave PIX.', 'error');
      return;
    }
    if (tempPixType === 'Telefone' && !/^\+?[0-9()\s-]{10,20}$/.test(pixKey)) {
      showToast('Informe um número de celular válido como chave PIX.', 'error');
      return;
    }

    // Mantém o saque bloqueado até a integração real e segura do provedor PIX.
    showToast('Saques ainda não estão conectados a um provedor seguro. Nenhuma solicitação ou débito foi realizado.', 'warning');
    return;
    // A solicitação real será habilitada após validação e reserva de saldo no servidor.

  };

  // ==========================================================================
  // COMPONENTE REUTILIZÁVEL: CARTÃO DE RESUMO DO USUÁRIO
  // ==========================================================================
  const AccountInsights = () => {
    const metrics = [
      { label: 'Saldo de depósito', value: user.depositBalance, color: 'from-blue-600 to-cyan-400', dot: 'bg-cyan-400' },
      { label: 'Disponível para saque', value: user.withdrawableBalance, color: 'from-emerald-500 to-teal-300', dot: 'bg-emerald-400' },
      { label: 'Comissões', value: user.commissionBalance, color: 'from-violet-600 to-fuchsia-400', dot: 'bg-fuchsia-400' },
      { label: 'Pontos Nexus', value: user.nexusPoints, color: 'from-amber-500 to-orange-300', dot: 'bg-amber-400', points: true }
    ];
    const maxValue = Math.max(...metrics.map((item) => Number(item.value) || 0), 0);
    const total = metrics.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    return (
      <section className="relative overflow-hidden rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-4 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative flex items-start justify-between gap-3">
          <div><div className="text-[10px] font-extrabold uppercase tracking-[.2em] text-cyan-300">NEXUS • PAINEL VISUAL</div><h3 className="mt-1 text-base font-black text-white">Visão da sua carteira</h3><p className="mt-1 text-[11px] text-blue-100/75">Indicadores vinculados à sua conta</p></div>
          <div className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-right"><div className="text-[9px] font-bold uppercase tracking-wider text-cyan-200">Total exibido</div><div className="mt-0.5 text-sm font-black text-white">{formatBRL(total)}</div></div>
        </div>
        <div className="relative mt-5 space-y-3">
          {metrics.map((item) => {
            const value = Number(item.value) || 0;
            const width = maxValue > 0 ? (value > 0 ? Math.max(3, (value / maxValue) * 100) : 0) : 0;
            return <div key={item.label}><div className="mb-1.5 flex items-center justify-between gap-2 text-[11px]"><span className="flex items-center gap-2 font-semibold text-blue-50"><span className={`h-2 w-2 rounded-full ${item.dot}`} />{item.label}</span><strong className="text-white">{item.points ? value.toFixed(2).replace('.', ',') : formatBRL(value)}</strong></div><div className="h-2.5 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/10"><div className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-700`} style={{ width: `${width}%` }} /></div></div>;
          })}
        </div>
        {maxValue === 0 && <div className="relative mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] leading-relaxed text-blue-100">Ainda não há movimentações confirmadas para formar as barras. Os gráficos serão preenchidos conforme dados reais forem registrados.</div>}
        <div className="relative mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3"><div className="text-[10px] font-bold uppercase tracking-wider text-cyan-200">Planos ativos</div><div className="mt-1 text-xl font-black">{activeInvestments.length}</div></div>
          <div className="rounded-xl border border-fuchsia-300/20 bg-fuchsia-300/10 p-3"><div className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-200">Planos encerrados</div><div className="mt-1 text-xl font-black">{completedInvestments.length}</div></div>
        </div>
        <p className="relative mt-3 text-[9px] leading-relaxed text-blue-100/60">Gráfico informativo. Não representa previsão ou garantia de rentabilidade.</p>
      </section>
    );
  };

  const PlanPriceChart = () => {
    const highestPrice = Math.max(...plans.map((plan) => plan.price), 1);
    return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2"><div><div className="text-[10px] font-extrabold uppercase tracking-[.18em] text-violet-600">COMPARATIVO</div><h3 className="mt-1 text-sm font-black text-slate-900">Valor de entrada por plano</h3><p className="mt-0.5 text-[10px] text-slate-500">Comparação dos preços cadastrados</p></div><div className="rounded-xl bg-violet-50 p-2.5 text-violet-700"><TrendingUp className="h-5 w-5" /></div></div>
      <div className="mt-4 space-y-3">{plans.map((plan, index) => <div key={plan.id}><div className="mb-1 flex items-center justify-between gap-2 text-[11px]"><span className="font-bold text-slate-700">{plan.name}</span><span className="font-extrabold text-slate-900">{formatBRL(plan.price)}</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full bg-gradient-to-r ${['from-blue-600 to-cyan-400','from-violet-600 to-fuchsia-400','from-emerald-500 to-teal-300','from-amber-500 to-orange-400'][index % 4]}`} style={{ width: `${Math.max(2, (plan.price / highestPrice) * 100)}%` }} /></div></div>)}</div>
      <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[10px] leading-relaxed text-amber-800">Os valores mostram somente o preço de entrada. Não indicam desempenho nem retorno futuro.</p>
    </section>;
  };

  const UserSummaryCard = () => (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-3">
      {/* Linha superior: Avatar, ID/UID e Badge VIP */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-900 to-indigo-700 text-white font-bold text-lg flex items-center justify-center shadow-inner">
            N
          </div>
          <div>
            <div className="font-bold text-slate-900 text-base leading-tight">{user.id}</div>
            <button
              onClick={() => handleCopy(user.uid, 'UID copiado')}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-700 mt-0.5 transition"
            >
              <span>UID: {user.uid}</span>
              <Copy className="w-3.5 h-3.5 text-blue-600" />
            </button>
          </div>
        </div>

        <button
          onClick={() => setSubPage('vip')}
          className="flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300/80 text-amber-800 px-3 py-1.5 rounded-full text-xs font-extrabold shadow-xs active:scale-95 transition"
        >
          <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
          <span>VIP {user.vipLevel}</span>
        </button>
      </div>

      {/* Grid 2x2 de indicadores */}
      <div className="grid grid-cols-2 gap-2.5 pt-3.5">
        <div className="bg-slate-50/90 border border-slate-100 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <Wallet className="w-3.5 h-3.5 text-blue-700" />
            <span>Saldo</span>
          </div>
          <div className="text-base font-extrabold text-slate-900 mt-1">
            {formatBRL(user.depositBalance)}
          </div>
        </div>

        <div className="bg-slate-50/90 border border-slate-100 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-600" />
            <span>Pode ser retirado</span>
          </div>
          <div className="text-base font-extrabold text-slate-900 mt-1">
            {formatBRL(user.withdrawableBalance)}
          </div>
        </div>

        <div className="bg-slate-50/90 border border-slate-100 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Pontos Nexus</span>
          </div>
          <div className="text-base font-extrabold text-slate-900 mt-1">
            {user.nexusPoints.toFixed(2).replace('.', ',')}
          </div>
        </div>

        <div className="bg-slate-50/90 border border-slate-100 rounded-xl p-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Remuneração</span>
          </div>
          <div className="text-base font-extrabold text-slate-900 mt-1">
            {formatBRL(user.commissionBalance)}
          </div>
        </div>
      </div>
    </div>
  );

  // ==========================================================================
  // RENDERIZAÇÃO DAS TELAS E SUB-PÁGINAS
  // ==========================================================================
  const renderMainContent = () => {
    // ------------------------------------------------------------------------
    // SUB-PÁGINA: DETALHES DO PRODUTO / PLANO
    // ------------------------------------------------------------------------
    if (subPage === 'plan-detail' && selectedPlan) {
      const currentPlan = plans.find((p) => p.id === selectedPlan.id) || selectedPlan;
      const totalReturn = currentPlan.dailyReturn * currentPlan.days;
      const isSoldOut = currentPlan.bought >= currentPlan.limit;

      return (
        <div className="space-y-3 animate-fadeIn">
          <button
            onClick={() => setSubPage(null)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-900 hover:text-blue-700 py-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar aos planos</span>
          </button>

          {/* Cabeçalho da tela de produto */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-800">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 nexus-title">Produto</h2>
              <p className="text-xs text-slate-500">Confira os valores e siga para o investimento.</p>
            </div>
          </div>

          {/* Info de pagamento */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
            <div className="text-xs text-slate-600">
              Pagamento: <strong className="text-slate-900">Somente depósito</strong>
            </div>
            <div className="text-xs font-bold text-blue-700 mt-0.5">{currentPlan.tag}</div>

            {/* Banner do plano */}
            <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
              <PlanVisualBanner plan={currentPlan} heightClass="h-44" />
            </div>

            {/* Título e preço */}
            <div className="flex items-center justify-between mt-4 pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 nexus-title">{currentPlan.name}</h3>
              <span className="text-lg font-extrabold text-blue-800">{formatBRL(currentPlan.price)}</span>
            </div>

            {/* Informação de transparência sobre projeções */}
            <p className="mt-3 text-[10px] leading-relaxed text-slate-500">Percentuais e valores exibidos são projeções calculadas com base nos parâmetros do plano; não representam garantia de rendimento ou promessa de resultado.</p>

            {/* Tabela de especificações */}
            <div className="divide-y divide-slate-100 text-xs mt-1">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Renda diária:</span>
                <span className="font-bold text-slate-900">{formatBRL(currentPlan.dailyReturn)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Ciclo:</span>
                <span className="font-bold text-slate-900">{currentPlan.days} dias</span>
              </div>
              <div className="py-3 px-3 my-1 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-[11px] font-bold uppercase tracking-wide text-emerald-800">Projeção acumulada do ciclo</div>
                <div className="text-xl font-black text-emerald-700 mt-0.5">+{((totalReturn / currentPlan.price) * 100).toFixed(1).replace('.', ',')}%</div>
                <div className="text-xs font-semibold text-emerald-800">{formatBRL(totalReturn)} em {currentPlan.days} dias (estimativa)</div>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className={`font-bold ${isSoldOut ? 'text-amber-600' : 'text-blue-700'}`}>
                  {isSoldOut ? 'Limite atingido' : 'Disponível'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Por conta:</span>
                <span className="font-bold text-slate-900">
                  {currentPlan.bought}/{currentPlan.limit} ({currentPlan.tag})
                </span>
              </div>
            </div>

            <button
              onClick={() => handleInvestPlan(currentPlan)}
              disabled={isSoldOut || investmentBusy}
              className={`w-full mt-4 py-3.5 rounded-xl font-bold text-sm text-white shadow-md transition active:scale-[0.99] ${
                isSoldOut
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-800 hover:from-blue-800 hover:to-indigo-700'
              }`}
            >
              {investmentBusy ? 'Ativando plano...' : isSoldOut ? 'Limite de cotas atingido' : 'Confirmar e investir agora'}
            </button>
          </div>
        </div>
      );
    }

    // ------------------------------------------------------------------------
    // SUB-PÁGINA: CLUBE VIP
    // ------------------------------------------------------------------------
    if (subPage === 'vip') {
      return (
        <div className="space-y-3">
          <button
            onClick={() => setSubPage(null)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-900 py-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Crown className="w-6 h-6 fill-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 nexus-title">VIP</h2>
              <p className="text-xs text-slate-500">Recarga pessoal, equipe e valor diário.</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-4 shadow-md border border-amber-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold tracking-wider uppercase text-amber-300">CLUBE VIP NEXUS</span>
              </div>
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full font-bold">
                Nível Atual: VIP {user.vipLevel}
              </span>
            </div>
            <h3 className="text-lg font-extrabold mt-2 nexus-title">
              {user.vipLevel === 0 ? 'Sem VIP Ativo' : `Membro VIP ${user.vipLevel}`}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              O resgate de 24 em 24 horas abre automaticamente quando você atinge o nível VIP 1.
            </p>
          </div>

          {/* Progresso para subir de nível */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-700" />
              <span>Como subir de nível</span>
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Para o próximo nível, os três requisitos precisam estar cumpridos ao mesmo tempo. A equipe é a rede de até 3 níveis.
            </p>
            <div className="divide-y divide-slate-100 text-xs mt-3">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600">Recarga pessoal</span>
                <span className="font-bold text-slate-900">{formatBRL(user.depositBalance)} / R$ 300,00</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600">Pessoas na equipe</span>
                <span className="font-bold text-slate-900">0 / 3</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-600">Recarga da equipe</span>
                <span className="font-bold text-slate-900">R$ 0,00 / R$ 300,00</span>
              </div>
            </div>
          </div>

          {/* Tabela Níveis VIP */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 overflow-x-auto">
            <h4 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>Níveis VIP</span>
            </h4>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2">Nível VIP</th>
                  <th className="py-2">Recarga pessoal</th>
                  <th className="py-2">Equipe</th>
                  <th className="py-2 text-right">Bônus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {VIP_LEVELS.map((v) => (
                  <tr key={v.level}>
                    <td className="py-2.5 font-extrabold text-amber-700">{v.level}</td>
                    <td className="py-2.5 font-semibold text-slate-800">{v.recharge}</td>
                    <td className="py-2.5 text-slate-600">{v.team}</td>
                    <td className="py-2.5 text-right font-bold text-blue-800">{v.bonus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // ------------------------------------------------------------------------
    // SUB-PÁGINA: CURSO DA PLATAFORMA (12 ETAPAS)
    // ------------------------------------------------------------------------
    if (subPage === 'course') {
      const currentGuide = PLATFORM_GUIDE_STEPS[guideStepIndex];
      return (
        <div className="space-y-3">
          <button
            onClick={() => setSubPage(null)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-900 py-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar ao Perfil</span>
          </button>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                CURSO INTERATIVO NEXUS AÇÕES
              </span>
              <span className="text-xs font-extrabold bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full">
                Etapa {currentGuide.step} de {PLATFORM_GUIDE_STEPS.length}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 nexus-title">Como usar a plataforma</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Navegue pelas etapas abaixo para dominar todas as ferramentas de rendimento.
            </p>

            {/* Barra de progresso do curso */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-gradient-to-r from-blue-800 to-cyan-500 transition-all duration-300"
                style={{ width: `${((guideStepIndex + 1) / PLATFORM_GUIDE_STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Card da Etapa Atual */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-700 text-white font-extrabold text-lg flex items-center justify-center shadow-md mb-4">
              {currentGuide.step}
            </div>
            <span className="inline-block text-[11px] font-bold text-cyan-800 bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 rounded-md mb-2">
              {currentGuide.highlight}
            </span>
            <h3 className="text-base font-extrabold text-slate-900 nexus-title">{currentGuide.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed mt-2">{currentGuide.desc}</p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={() => setGuideStepIndex((prev) => Math.max(0, prev - 1))}
                disabled={guideStepIndex === 0}
                className="py-3 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 disabled:opacity-40 hover:bg-slate-50"
              >
                Etapa anterior
              </button>
              {guideStepIndex < PLATFORM_GUIDE_STEPS.length - 1 ? (
                <button
                  onClick={() => setGuideStepIndex((prev) => prev + 1)}
                  className="py-3 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-800 shadow-sm"
                >
                  Próxima etapa
                </button>
              ) : (
                <button
                  onClick={() => {
                    setGuideStepIndex(0);
                    setSubPage(null);
                    showToast('Parabéns! Você concluiu o guia da NEXUS AÇÕES.', 'success');
                  }}
                  className="py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm"
                >
                  Concluir guia
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // ------------------------------------------------------------------------
    // SUB-PÁGINA: MÉTODO DE SAQUE (CHAVE PIX)
    // ------------------------------------------------------------------------
    if (subPage === 'pix-method') {
      const pixTypes = ['CPF', 'E-mail', 'Telefone'];
      return (
        <div className="space-y-3">
          <button
            onClick={() => setSubPage(null)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-900 py-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-800">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 nexus-title">Chave PIX</h2>
              <p className="text-xs text-slate-500">Cadastre onde deseja receber os saques.</p>
            </div>
          </div>

          <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3.5 flex items-center gap-3">
            <QrCode className="w-7 h-7 text-blue-800 shrink-0" />
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">DESTINO DO SAQUE</div>
              <div className="text-sm font-bold text-slate-900">
                {user.pixKey ? `${user.pixKeyType}: ${user.pixKey}` : 'Nenhuma chave cadastrada'}
              </div>
              <div className="text-[11px] text-slate-500">{tempPixType} • pronto para salvar</div>
            </div>
          </div>

          <form onSubmit={handleSavePixKey} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-2">Tipo de chave</label>
              <div className="grid grid-cols-2 gap-2">
                {pixTypes.map((type) => {
                  const isSelected = tempPixType === type;
                  return (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setTempPixType(type)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-bold transition ${
                        isSelected
                          ? 'border-blue-800 bg-blue-50 text-blue-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{type}</span>
                      {isSelected && <Check className="w-4 h-4 text-blue-800" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Sua chave • {tempPixType}
              </label>
              <input
                type="text"
                value={tempPixKey}
                onChange={(e) => setTempPixKey(e.target.value)}
                placeholder={`Digite sua chave ${tempPixType}`}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-800 text-white font-bold text-sm shadow-md hover:opacity-95 active:scale-[0.99] transition"
            >
              Salvar chave PIX
            </button>
          </form>
        </div>
      );
    }

    // ------------------------------------------------------------------------
    // SUB-PÁGINA: RETIRADA (SAQUE)
    // ------------------------------------------------------------------------
    if (subPage === 'withdraw') {
      const numericWithdraw = parseFloat(withdrawAmount) || 0;
      const feeValue = Number((numericWithdraw * 0.05).toFixed(2));
      const receiveValue = Math.max(0, Number((numericWithdraw - feeValue).toFixed(2)));

      return (
        <div className="space-y-3">
          <button
            onClick={() => setSubPage(null)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-900 py-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-800">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 nexus-title">Retirada</h2>
              <p className="text-xs text-slate-500">Com pelo menos um plano ativo, o saldo de bônus de cadastro e check-ins também pode compor o valor disponível para saque.</p>
            </div>
          </div>

          <UserSummaryCard />

          <div className={`rounded-xl border p-3 text-xs leading-relaxed ${activeInvestments.length > 0 ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
            {activeInvestments.length > 0
              ? `Plano ativo detectado. Bônus de cadastro e recompensas de check-in podem compor o saldo para saque. Mínimo: R$ 10,00.`
              : 'Para liberar o saque dos bônus de cadastro e check-ins, é necessário ter pelo menos um plano ativo. O mínimo para saque é R$ 10,00.'}
          </div>

          {/* Atalho Chave PIX */}
          <button
            onClick={() => {
              setTempPixType(user.pixKeyType);
              setTempPixKey(user.pixKey);
              setSubPage('pix-method');
            }}
            className="w-full bg-blue-50/90 border border-blue-200 rounded-2xl p-3.5 flex items-center justify-between text-left hover:bg-blue-100/70 transition"
          >
            <div className="flex items-center gap-3">
              <QrCode className="w-7 h-7 text-blue-800" />
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">CHAVE PIX</div>
                <div className="text-sm font-bold text-slate-900">
                  {user.pixKey ? `${user.pixKeyType}: ${user.pixKey}` : 'Nenhuma chave cadastrada'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {user.pixKey ? 'Toque para alterar' : 'Toque para cadastrar'}
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-800" />
          </button>

          {/* Dados obrigatórios para identificação e destino do saque */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900">Dados obrigatórios para receber</h3>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">CPF do solicitante</label>
              <input type="text" inputMode="numeric" autoComplete="off" value={withdrawCpf} onChange={(e) => setWithdrawCpf(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))} placeholder="Digite os 11 números do CPF" className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Nome completo do titular da conta bancária</label>
              <input type="text" autoComplete="name" value={withdrawHolderName} onChange={(e) => setWithdrawHolderName(e.target.value)} placeholder="Nome exatamente como consta no banco" className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Tipo de chave PIX</label>
              <select value={tempPixType} onChange={(e) => setTempPixType(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700">
                <option value="CPF">CPF</option><option value="E-mail">E-mail</option><option value="Telefone">Número de celular</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">Chave PIX para receber</label>
              <input type="text" autoComplete="off" value={tempPixKey} onChange={(e) => setTempPixKey(e.target.value)} placeholder={tempPixType === 'CPF' ? 'CPF da chave PIX' : tempPixType === 'E-mail' ? 'seuemail@exemplo.com' : 'DDD + número do celular'} className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700" />
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">Confira os dados antes de continuar. O CPF identifica o solicitante; a chave PIX indica o destino do pagamento.</p>
          </div>

          {/* Formulário de Saque */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900">Quanto deseja sacar?</span>
              <span className="text-[11px] text-slate-500">
                Mínimo R$ 10,00. Disponível {formatBRL(user.withdrawableBalance)}
              </span>
            </div>

            <input
              type="number"
              min="10"
              step="0.01"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0,00"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xl font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
            />

            <button
              type="button"
              onClick={() => setWithdrawAmount(String(user.withdrawableBalance.toFixed(2)))}
              className="text-xs font-bold text-blue-700 hover:underline"
            >
              Usar saldo total
            </button>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Solicitado</span>
                <span className="font-bold text-slate-900">{formatBRL(numericWithdraw)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Taxa de 5%</span>
                <span className="font-bold text-rose-600">- {formatBRL(feeValue)}</span>
              </div>
              <div className="flex justify-between text-sm pt-1 border-t border-slate-100">
                <span className="font-extrabold text-slate-900">Você recebe</span>
                <span className="font-extrabold text-blue-800">{formatBRL(receiveValue)}</span>
              </div>
            </div>

            <button
              onClick={handleRequestWithdraw}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-800 text-white font-bold text-sm shadow-md hover:opacity-95 active:scale-[0.99] transition"
            >
              Solicitar saque
            </button>

            <div className="flex items-start gap-2 text-[11px] text-slate-500 pt-1">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>É necessário manter pelo menos um plano ativo. Bônus de cadastro e check-ins entram no saldo disponível; saldo de depósito não é sacável.</span>
            </div>
          </div>
        </div>
      );
    }

    // ------------------------------------------------------------------------
    // SUB-PÁGINA: INSÍGNIAS
    // ------------------------------------------------------------------------
    if (subPage === 'badges') {
      const completedCount = badges.filter((b) => b.completed).length;
      return (
        <div className="space-y-3">
          <button
            onClick={() => setSubPage(null)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-900 py-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 nexus-title">Insígnias</h2>
                <p className="text-xs text-slate-500">As conquistas e recompensas definidas no painel.</p>
              </div>
            </div>
            <span className="text-xs font-extrabold bg-blue-50 text-blue-800 px-2.5 py-1 rounded-full">
              {completedCount}/{badges.length}
            </span>
          </div>

          {/* Conquistadas */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-1">Conquistadas</h3>
            {badges.filter((b) => b.completed).map((badge) => (
              <div
                key={badge.id}
                className="bg-white rounded-2xl p-3.5 shadow-sm border border-blue-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">{badge.title}</div>
                    <div className="text-xs text-slate-500">{badge.desc}</div>
                    <div className="text-[11px] font-bold text-blue-700 mt-0.5">{badge.reward}</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-full">
                  Completada
                </span>
              </div>
            ))}
          </div>

          {/* Bloqueadas */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-1">Bloqueadas</h3>
            {badges.filter((b) => !b.completed).map((badge) => (
              <div
                key={badge.id}
                className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80 flex items-center justify-between opacity-90"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{badge.title}</div>
                    <div className="text-xs text-slate-500">{badge.desc}</div>
                    <div className="text-[11px] font-semibold text-blue-700 mt-0.5">{badge.reward}</div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                  Bloqueada
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ------------------------------------------------------------------------
    // SUB-PÁGINA: CUPONS / EXTRATO DE PONTOS
    // ------------------------------------------------------------------------
    if (subPage === 'coupons') {
      return (
        <div className="space-y-3">
          <button
            onClick={() => setSubPage(null)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-900 py-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-800">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 nexus-title">Histórico & Cupons</h2>
              <p className="text-xs text-slate-500">Entradas e saídas de pontos e bônus das suas carteiras.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">MOVIMENTAÇÃO</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">{couponLogs.length} registro(s)</div>
            <div className="text-xs text-slate-500">{couponLogs.length} entradas • 0 saídas</div>
          </div>

          <div className="space-y-2">
            {couponLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">{log.title}</div>
                    <div className="text-[11px] text-slate-500">{log.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-extrabold text-blue-800">{log.amount}</div>
                  <div className="text-[10px] text-slate-400">{log.balanceAfter}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ------------------------------------------------------------------------
    // SUB-PÁGINA: REGISTROS DE DEPÓSITO E RETIRADA
    // ------------------------------------------------------------------------
    if (subPage === 'deposit-records' || subPage === 'withdraw-records') {
      const isDeposit = subPage === 'deposit-records';
      const list = isDeposit ? depositHistory : withdrawHistory;

      return (
        <div className="space-y-3">
          <button
            onClick={() => setSubPage(null)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-900 py-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-800">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 nexus-title">
                {isDeposit ? 'Registros de depósito' : 'Registros de retirada'}
              </h2>
              <p className="text-xs text-slate-500">
                {isDeposit ? 'Acompanhe todas as suas recargas via PIX.' : 'Acompanhe suas solicitações de saque.'}
              </p>
            </div>
          </div>

          {list.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80">
              <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-700">Nenhum registro encontrado</div>
              <p className="text-xs text-slate-500 mt-1">
                Suas movimentações aparecerão automaticamente aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {list.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">#{item.id}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.date}</div>
                    {!isDeposit && (
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.pixKey}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-blue-900">
                      {formatBRL(isDeposit ? item.amount : item.net)}
                    </div>
                    <span className="inline-block text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full mt-1">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // ------------------------------------------------------------------------
    // SUB-PÁGINA: TROCAR SENHA
    // ------------------------------------------------------------------------
    if (subPage === 'change-password') {
      const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (!passwords.current || passwords.next.length < 5) {
          showToast('A nova senha deve ter no mínimo 5 caracteres.', 'error');
          return;
        }
        if (passwords.next !== passwords.confirm) {
          showToast('A confirmação da nova senha não confere.', 'error');
          return;
        }
        setPasswords({ current: '', next: '', confirm: '' });
        showToast('Senha atualizada com sucesso!', 'success');
        setSubPage(null);
      };

      return (
        <div className="space-y-3">
          <button
            onClick={() => setSubPage(null)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-900 py-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-800">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 nexus-title">Senha</h2>
              <p className="text-xs text-slate-500">A nova senha precisa ter pelo menos 5 caracteres.</p>
            </div>
          </div>

          <UserSummaryCard />

          <form onSubmit={handlePasswordSubmit} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3.5">
            <div className="flex items-center gap-2 text-blue-800 text-xs font-extrabold uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>SEGURANÇA</span>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 nexus-title">Troque a senha da conta</h3>
              <p className="text-xs text-slate-500">Não compartilhe e evite repetir a senha de outros serviços.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Senha atual</label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                placeholder="Digite sua senha atual"
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nova senha</label>
              <input
                type="password"
                value={passwords.next}
                onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                placeholder="Mínimo de 5 caracteres"
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirmar nova senha</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                placeholder="Repita a nova senha"
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-800 text-white font-bold text-sm shadow-md hover:opacity-95 transition"
            >
              Salvar nova senha
            </button>
          </form>
        </div>
      );
    }

    // ------------------------------------------------------------------------
    // SUB-PÁGINA: INTRODUÇÃO AOS PONTOS NEXUS / VIP
    // ------------------------------------------------------------------------
    if (subPage === 'points-intro' || subPage === 'vip-intro') {
      const isPoints = subPage === 'points-intro';
      return (
        <div className="space-y-3">
          <button
            onClick={() => setSubPage(null)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-900 py-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center">
              {isPoints ? <Sparkles className="w-6 h-6" /> : <Crown className="w-6 h-6 text-amber-600" />}
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 nexus-title">
              {isPoints ? 'Introdução aos Pontos Nexus' : 'Introdução ao Clube VIP'}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isPoints
                ? 'Os Pontos Nexus funcionam como o combustível operacional dos seus contratos de ações. A cada ciclo de 24 horas, você utiliza seus Pontos Nexus para acelerar e validar o resgate do rendimento diário diretamente para sua carteira de saque.'
                : 'O Clube VIP recompensa investidores ativos que constroem rede na NEXUS AÇÕES. Ao cumprir os requisitos simultâneos de recarga pessoal, membros diretos/indiretos e volume da equipe, você sobe de patente e recebe bônus instantâneos e diários.'}
            </p>
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/70 space-y-2 text-xs text-slate-700">
              <div className="font-bold text-slate-900">Como acumular mais rápido:</div>
              <div>• Abertura de conta verificada: +0,50 pontos</div>
              <div>• Ativação de novos planos de ações: +0,40 pontos</div>
              <div>• Coleta diária de dividendos: +0,55 pontos</div>
              <div>• Indicação de novos investidores: até 15% em pontos</div>
            </div>
          </div>
        </div>
      );
    }

    // ------------------------------------------------------------------------
    // TELA 1: INÍCIO
    // ------------------------------------------------------------------------
    if (activeTab === 'inicio') {
      return (
        <div className="space-y-3">
          {/* Resumo da Conta */}
          <UserSummaryCard />

          <section className="relative overflow-hidden rounded-2xl border border-emerald-300/60 bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-900 p-4 text-white shadow-lg">
            <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-emerald-300/20 blur-3xl" />
            <div className="relative flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-extrabold tracking-[.18em] text-emerald-200">RECOMPENSA DIÁRIA</div>
                <h3 className="mt-1 text-lg font-black">Check-in diário</h3>
                <p className="mt-1 text-xs text-emerald-100/85">Faça um check-in gratuito por dia e receba R$ 1,00 em saldo interno. A liberação acontece à meia-noite (horário de Brasília).</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-200/40 bg-white/10"><CheckCircle2 className="h-7 w-7 text-emerald-200" /></div>
            </div>
            <div className="relative mt-4 flex items-center justify-between gap-3">
              <div><div className="text-2xl font-black">R$ 1,00</div><div className="text-[10px] text-emerald-100/70">Crédito no saldo interno</div></div>
              <button type="button" onClick={handleDailyCheckin} disabled={checkinBusy || !database || checkinDoneToday} className="rounded-xl bg-white px-4 py-3 text-xs font-black text-emerald-900 shadow-md transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60">
                {checkinBusy ? 'Confirmando...' : checkinDoneToday ? `Volta em ${checkinCountdown}` : 'Fazer check-in'}
              </button>
            </div>
            <div className="relative mt-3 flex items-center justify-between border-t border-white/15 pt-3 text-[10px] text-emerald-100/80"><span>Check-ins acumulados: {Number(walletData.checkinCount || 0)}</span><span>Saldo de recompensas: {formatBRL(user.withdrawableBalance)}</span></div>
          </section>

          <AccountInsights />

          {/* Cartão CLUBE VIP */}
          <button
            onClick={() => setSubPage('vip')}
            className="w-full bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-4 shadow-md border border-amber-400/30 flex items-center justify-between text-left active:scale-[0.99] transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center">
                <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold tracking-widest uppercase text-amber-400">
                  CLUBE VIP
                </div>
                <div className="text-base font-extrabold text-white">VIP {user.vipLevel}</div>
                <div className="text-[11px] text-slate-300">Nível {user.vipLevel} • recarga e valor diário</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-amber-300" />
          </button>

          {/* 4 Ações Rápidas */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Depositar', action: () => navigateToTab('depositar') },
              { label: 'Sacar', action: () => setSubPage('withdraw') },
              { label: 'VIP', action: () => setSubPage('vip') },
              { label: 'Equipe', action: () => navigateToTab('equipe') }
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={btn.action}
                className="bg-white hover:bg-blue-50/70 border border-slate-200/80 rounded-xl py-3 px-2 text-xs font-extrabold text-slate-800 shadow-2xs active:scale-95 transition text-center"
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Cartão INDICAÇÕES */}
          <button
            onClick={() => navigateToTab('equipe')}
            className="w-full bg-gradient-to-r from-blue-50 to-indigo-50/80 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between text-left shadow-2xs active:scale-[0.99] transition"
          >
            <div>
              <div className="text-[10px] font-extrabold tracking-wider uppercase text-blue-700">INDICAÇÕES</div>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">Equipe</div>
              <div className="text-xs text-slate-600">Código, link e comissões</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5" />
            </div>
          </button>

          {/* Seção Planos Disponíveis */}
          <div className="pt-1">
            <div className="flex items-center justify-between px-1 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-800" />
                <h3 className="text-sm font-extrabold text-slate-900 nexus-title">Planos disponíveis</h3>
              </div>
              <button
                onClick={() => {
                  navigateToTab('investir');
                  setInvestSubTab('investir');
                }}
                className="text-xs font-bold text-blue-700 hover:underline"
              >
                Ver todos
              </button>
            </div>

            <div className="space-y-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => openPlanDetails(plan)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 cursor-pointer hover:border-blue-300 active:scale-[0.99] transition"
                >
                  <PlanVisualBanner plan={plan} heightClass="h-36" />
                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{plan.name}</h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-xs text-slate-600">{formatBRL(plan.dailyReturn)} estimados/dia · {plan.days} dias</span>
                        <span className="inline-flex items-center rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-1 text-xs font-extrabold text-emerald-800">
                          +{((plan.dailyReturn * plan.days / plan.price) * 100).toFixed(1).replace('.', ',')}% acumulado estimado
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-blue-700 mt-0.5">
                        {plan.tag} {plan.bought > 0 ? `• ${plan.bought} feita(s)` : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-extrabold text-blue-900">{formatBRL(plan.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ------------------------------------------------------------------------
    // TELA 2: INVESTIR
    // ------------------------------------------------------------------------
    if (activeTab === 'investir') {
      return (
        <div className="space-y-3">
          {/* Cabeçalho Investir */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-800">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 nexus-title">Investir</h2>
              <p className="text-xs text-slate-500">
                Acompanhe o prazo, a barra de dias e os valores informativos dos seus planos.
              </p>
              <p className="text-[11px] font-bold text-blue-700 mt-0.5">
                Pontos Nexus disponíveis: {user.nexusPoints.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>

          {/* Sub-abas em pílula */}
          <div className="grid grid-cols-3 gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            {[
              { id: 'investir', label: 'Investir' },
              { id: 'iniciado', label: `Iniciado (${activeInvestments.length})` },
              { id: 'encerrados', label: `Encerrados (${completedInvestments.length})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setInvestSubTab(tab.id)}
                className={`py-2.5 rounded-xl text-xs font-extrabold transition ${
                  investSubTab === tab.id
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {investSubTab === 'investir' && <PlanPriceChart />}

          {/* Conteúdo Sub-aba: INVESTIR (Vitrine) */}
          {investSubTab === 'investir' && (
            <div className="space-y-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => openPlanDetails(plan)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200/80 cursor-pointer hover:border-blue-300 transition"
                >
                  <PlanVisualBanner plan={plan} heightClass="h-32" />
                  <div className="p-3.5 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">{plan.name}</h4>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-xs text-slate-600">{formatBRL(plan.dailyReturn)} estimados/dia · {plan.days} dias</span>
                        <span className="inline-flex items-center rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-1 text-xs font-extrabold text-emerald-800">
                          +{((plan.dailyReturn * plan.days / plan.price) * 100).toFixed(1).replace('.', ',')}% acumulado estimado
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-blue-700 mt-0.5">{plan.tag}</div>
                    </div>
                    <div className="text-base font-extrabold text-blue-900">{formatBRL(plan.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Conteúdo Sub-aba: INICIADO (Em uso) */}
          {investSubTab === 'iniciado' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <TrendingUp className="w-4 h-4 text-blue-800" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Em uso</h3>
              </div>

              {activeInvestments.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80">
                  <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <div className="text-sm font-bold text-slate-800">Nenhum plano ativo no momento</div>
                  <p className="text-xs text-slate-500 mt-1">
                    Escolha um plano para acompanhar seu ciclo, os dias restantes e os valores informativos. Os pagamentos são registrados manualmente pela administração.
                  </p>
                  <button
                    onClick={() => setInvestSubTab('investir')}
                    className="mt-4 px-5 py-2.5 rounded-xl bg-blue-900 text-white text-xs font-bold"
                  >
                    Explorar planos
                  </button>
                </div>
              ) : (
                activeInvestments.map((inv) => {
                  const firstCreditAt = Number(inv.firstCreditAt || 0);
                  const elapsed = checkinClock < firstCreditAt ? 0 : Math.min(Number(inv.days || 0), Math.floor((checkinClock - firstCreditAt) / 86400000) + 1);
                  const daysRemaining = Math.max(0, Number(inv.days || 0) - elapsed);
                  const progressPct = Math.min(100, Math.max(0, Math.round((elapsed / Math.max(1, Number(inv.days || 1))) * 100)));
                  const totalExpected = Number(inv.projectedTotal || (inv.dailyReturn * inv.days));
                  const nextMidnight = firstCreditAt > checkinClock ? firstCreditAt : (Math.floor((checkinClock - firstCreditAt) / 86400000) + 1) * 86400000 + firstCreditAt;
                  return (
                    <div
                      key={inv.instanceId}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-900 to-cyan-700 text-white flex items-center justify-center font-extrabold text-xs">
                            NX
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-900">{inv.name}</h4>
                            <span className="text-sm font-extrabold text-blue-800">{formatBRL(inv.price)}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-full">
                          Em uso
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Renda diária:</span>
                          <span className="font-bold text-slate-900">{formatBRL(inv.dailyReturn)} (previsto)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tempo de início:</span>
                          <span className="font-semibold text-slate-700">{new Date(Number(inv.startAt || 0)).toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tempo de término:</span>
                          <span className="font-semibold text-slate-700">{new Date(firstCreditAt + Number(inv.days || 0) * 86400000).toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Renda acumulada:</span>
                          <span className="font-extrabold text-emerald-700">{formatBRL(Number(inv.paidTotal || 0))} pago</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Ciclo:</span>
                          <span className="font-bold text-slate-900">
                            {inv.days} dias · projeção {formatBRL(totalExpected)}
                          </span>
                        </div>
                      </div>

                      {/* Barra de Progresso */}
                      <div>
                        <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                          <span>{elapsed}/{inv.days} dias</span>
                          <span className="text-blue-800">{progressPct}%</span>
                          <span>{daysRemaining} restantes</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-800 to-cyan-500 transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <div className="text-center text-[11px] text-slate-500 mt-1.5">
                          {elapsed === 0 ? `Primeiro dia do ciclo: ${new Date(firstCreditAt).toLocaleString('pt-BR')}` : `${daysRemaining} dia(s) restante(s) no ciclo`}
                        </div>
                      </div>

                      <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-[11px] leading-relaxed text-blue-900">
                        Os valores diários e o total do ciclo são apenas informativos. O pagamento é feito manualmente pela administração e só entra no saldo sacável após a confirmação no painel.
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Conteúdo Sub-aba: ENCERRADOS */}
          {investSubTab === 'encerrados' && (
            <div className="space-y-3">
              {completedInvestments.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80">
                  <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <div className="text-sm font-bold text-slate-800">Nenhum plano encerrado</div>
                  <p className="text-xs text-slate-500 mt-1">
                    Os planos que concluírem todo o ciclo de dias aparecerão aqui.
                  </p>
                </div>
              ) : (
                completedInvestments.map((inv) => (
                  <div key={inv.instanceId} className="bg-white rounded-2xl p-4 border border-slate-200/80">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-sm text-slate-900">{inv.name}</span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        Concluído
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Ciclo concluído. Valores pagos manualmente: <strong className="text-slate-900">{formatBRL(Number(inv.paidTotal || 0))}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      );
    }

    // ------------------------------------------------------------------------
    // TELA 3: DEPOSITAR (CARTEIRA NEXUS AÇÕES)
    // ------------------------------------------------------------------------
    if (activeTab === 'depositar') {
      const quickAmounts = [50, 100, 200, 250, 500, 1000, 2500, 5000];
      return (
        <div className="space-y-3">
          {/* Card Principal Carteira */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md">
              <Wallet className="w-3.5 h-3.5" />
              <span>CARTEIRA NEXUS AÇÕES</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-2 nexus-title">
              Adicione saldo à sua carteira!
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Escolha o valor e gere o PIX instantâneo.</p>
          </div>

          {/* Pedido pendente: recuperação disponível somente nesta página de Depósito. */}
          {pendingDepositRequest && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800">Depósito aguardando pagamento</div>
                  <div className="mt-1 text-xl font-black text-slate-900">{formatBRL(pendingDepositRequest.amount)}</div>
                  <p className="mt-1 text-xs text-slate-600">
                    Seu pedido continua salvo. Abra para consultar o código PIX e concluir o pagamento.
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold text-amber-800">Pendente</span>
              </div>
              <button
                type="button"
                onClick={() => setPixModalData({
                  amount: Number(pendingDepositRequest.amount || 0),
                  requestId: pendingDepositRequest.id,
                  code: pendingDepositRequest.pixCopyPaste || '',
                  status: pendingDepositRequest.status || 'pending'
                })}
                className="w-full rounded-xl bg-blue-900 px-4 py-3 text-xs font-extrabold text-white shadow-sm flex items-center justify-center gap-2"
              >
                <QrCode className="h-4 w-4" />
                {pendingDepositRequest.pixCopyPaste ? 'Ver código PIX e pagar' : 'Consultar pedido / aguardar código PIX'}
              </button>
            </div>
          )}

          {/* Card Valores Rápidos */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-sm font-extrabold text-slate-900">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Valores rápidos</span>
              </div>
              <span className="text-[11px] text-slate-400">Escolha um valor</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">Selecione quanto deseja adicionar à sua carteira.</p>

            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((amt) => {
                const isSelected = Number(depositAmount) === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(String(amt))}
                    className={`py-2.5 rounded-xl text-xs font-extrabold border transition active:scale-95 ${
                      isSelected
                        ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-blue-50'
                    }`}
                  >
                    R$ {amt.toLocaleString('pt-BR')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Outro Valor */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center font-extrabold text-xs">
                R$
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 nexus-title">Outro valor</h3>
                <p className="text-[11px] text-slate-500">Digite o valor que deseja depositar.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Valor do depósito</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-400">
                  R$
                </span>
                <input
                  type="number"
                  min="50"
                  max="5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-base font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs pt-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Depósito mínimo</span>
                <span className="font-bold text-slate-900">R$ 50,00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Depósito máximo</span>
                <span className="font-bold text-slate-900">R$ 5.000,00</span>
              </div>
            </div>

            <button
              onClick={handleGeneratePix}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition"
            >
              <QrCode className="w-4 h-4" />
              <span>Gerar PIX</span>
            </button>
          </div>
        </div>
      );
    }

    // ------------------------------------------------------------------------
    // TELA 4: EQUIPE
    // ------------------------------------------------------------------------
    if (activeTab === 'equipe') {
      const inviteLink = `https://nexusacoes.com/register?code=${user.inviteCode}`;
      return (
        <div className="space-y-3">
          {/* Cabeçalho Equipe */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-800">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 nexus-title">Equipe</h2>
              <p className="text-xs text-slate-500">
                Nível A é o indicado direto. Nível B é o indicado do indicado.
              </p>
            </div>
          </div>

          <UserSummaryCard />

          {/* Cartão Programa de Indicação */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                PROGRAMA DE INDICAÇÃO
              </span>
              <div className="text-xl font-extrabold text-slate-900 tracking-wider mt-0.5">
                {user.inviteCode}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Link de convite:{' '}
                <span className="font-semibold text-blue-800 break-all">{inviteLink}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleCopy(user.inviteCode, 'Código copiado')}
                className="py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-800 hover:bg-slate-50 active:scale-95 transition"
              >
                Código
              </button>
              <button
                onClick={() => handleCopy(inviteLink, 'Link copiado')}
                className="py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-800 hover:bg-slate-50 active:scale-95 transition"
              >
                Link
              </button>
              <button
                onClick={() => handleCopy(`Venha investir na NEXUS AÇÕES! Cadastre-se pelo meu link: ${inviteLink}`, 'Convite pronto para enviar')}
                className="py-2.5 rounded-xl bg-blue-900 text-white text-xs font-extrabold hover:bg-blue-800 active:scale-95 transition"
              >
                Enviar
              </button>
            </div>
          </div>

          {/* 4 Atalhos rápidos */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Início', action: () => navigateToTab('inicio') },
              { label: 'Sacar', action: () => setSubPage('withdraw') },
              { label: 'VIP', action: () => setSubPage('vip') },
              { label: 'Perfil', action: () => navigateToTab('perfil') }
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={btn.action}
                className="bg-white border border-slate-200/80 rounded-xl py-2.5 text-xs font-extrabold text-slate-800 shadow-2xs"
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Tabela Comissões da Rede */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <Users className="w-4 h-4 text-blue-800" />
              <span>Comissões da rede</span>
            </div>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="py-2">Nível</th>
                  <th className="py-2 text-center">Comissão</th>
                  <th className="py-2 text-right">Pontos Nexus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 font-bold text-slate-800">Nível A</td>
                  <td className="py-2.5 text-center font-extrabold text-blue-800">7%</td>
                  <td className="py-2.5 text-right font-extrabold text-cyan-700">15%</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-bold text-slate-800">Nível B</td>
                  <td className="py-2.5 text-center font-extrabold text-blue-800">3%</td>
                  <td className="py-2.5 text-right font-extrabold text-cyan-700">5%</td>
                </tr>
              </tbody>
            </table>

            {/* Grid 2x2 contadores da rede */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                <div className="text-[11px] text-slate-500">Na rede</div>
                <div className="text-base font-extrabold text-slate-900">0</div>
                <div className="text-[10px] text-slate-400">0 online agora</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                <div className="text-[11px] text-slate-500">Comissão</div>
                <div className="text-base font-extrabold text-slate-900">R$ 0,00</div>
                <div className="text-[10px] text-slate-400">0,00 pontos Nexus</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                <div className="text-[11px] text-slate-500">Investido</div>
                <div className="text-base font-extrabold text-slate-900">R$ 0,00</div>
                <div className="text-[10px] text-slate-400">0 já investiram</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                <div className="text-[11px] text-slate-500">Rendimento</div>
                <div className="text-base font-extrabold text-slate-900">R$ 0,00</div>
                <div className="text-[10px] text-slate-400">Soma do rendimento da rede</div>
              </div>
            </div>

            <button
              onClick={() => handleCopy(inviteLink, 'Link de convite copiado')}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition"
            >
              <Share2 className="w-4 h-4" />
              <span>Convide seus amigos</span>
            </button>
          </div>

          {/* Busca e Filtros da Árvore da Rede */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                placeholder="Buscar telefone do indicado"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'Todos os níveis' },
                { id: 'commission', label: 'Mais comissão' },
                { id: 'online', label: 'Só online' },
                { id: 'invested', label: 'Já investiram' },
                { id: 'signup', label: 'Só cadastro' },
                { id: 'tree', label: 'Árvore' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTeamFilter(f.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition ${
                    teamFilter === f.id
                      ? 'bg-blue-900 text-white border-blue-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs font-extrabold text-slate-800">Árvore da rede</div>
              <p className="text-xs text-slate-500 mt-1">
                {teamSearch
                  ? `Nenhum membro encontrado para "${teamSearch}".`
                  : 'Ninguém entrou na sua rede ainda. Compartilhe seu link acima!'}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // ------------------------------------------------------------------------
    // TELA 5: PERFIL
    // ------------------------------------------------------------------------
    if (activeTab === 'perfil') {
      const menuItems = [
        { label: 'Curso da plataforma', icon: BookOpen, action: () => { setGuideStepIndex(0); setSubPage('course'); } },
        {
          label: 'Método de saque',
          icon: CreditCard,
          action: () => {
            setTempPixType(user.pixKeyType);
            setTempPixKey(user.pixKey);
            setSubPage('pix-method');
          }
        },
        { label: 'Equipe', icon: Users, action: () => navigateToTab('equipe') },
        { label: 'Introdução aos Pontos Nexus', icon: Sparkles, action: () => setSubPage('points-intro') },
        { label: 'Introdução VIP', icon: Crown, action: () => setSubPage('vip-intro') },
        { label: 'Insígnias', icon: Award, action: () => setSubPage('badges') },
        { label: 'Cupons', icon: Ticket, action: () => setSubPage('coupons') },
        { label: 'Registros de depósito', icon: History, action: () => setSubPage('deposit-records') },
        { label: 'Registros de retirada', icon: History, action: () => setSubPage('withdraw-records') },
        { label: 'Trocar senha', icon: Lock, action: () => setSubPage('change-password') }
      ];

      return (
        <div className="space-y-3">
          {/* Cabeçalho Perfil */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-800">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 nexus-title">Perfil</h2>
              <p className="text-xs text-slate-500">Carteira, depósitos, saques e atalhos da conta.</p>
            </div>
          </div>

          <UserSummaryCard />

          {/* Botões + Depósito e Retirada */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => navigateToTab('depositar')}
              className="py-3 rounded-full bg-gradient-to-r from-blue-900 to-indigo-800 text-white font-extrabold text-sm shadow-sm active:scale-95 transition"
            >
              + Depósito
            </button>
            <button
              onClick={() => setSubPage('withdraw')}
              className="py-3 rounded-full bg-white border border-slate-200 text-slate-900 font-extrabold text-sm shadow-2xs hover:bg-slate-50 active:scale-95 transition"
            >
              Retirada
            </button>
          </div>

          {/* Lista de Menus do Perfil */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 active:bg-slate-100 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-blue-800" />
                    <span className="text-xs font-bold text-slate-800">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return null;
  };

  // ==========================================================================
  // ESTRUTURA GLOBAL (TOP BAR, CONTAINER MOBILE-FIRST, AVISOS E BOTTOM NAV)
  // ==========================================================================
  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900 flex justify-center font-sans">
      {/* Container centralizado estilo App Mobile */}
      <div className="w-full max-w-none bg-[#f1f5f9] min-h-screen relative shadow-none flex flex-col">
        {/* ====================================================================
            1. CABEÇALHO FIXO (TOP BAR)
           ==================================================================== */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu"
            className="p-2 -ml-2 rounded-xl text-blue-900 hover:bg-blue-50 transition"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo e Nome NEXUS AÇÕES Centralizados */}
          <button
            onClick={() => navigateToTab('inicio')}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-900 via-indigo-800 to-cyan-600 flex items-center justify-center shadow-sm border border-amber-400/50">
              <TrendingUp className="w-4 h-4 text-amber-300" />
            </div>
            <span className="font-black text-base tracking-tight nexus-title">
              NEXUS <span>AÇÕES</span>
            </span>
          </button>

          {/* Ícones Notificação e Perfil */}
          <div className="flex items-center gap-1 -mr-1">
            <button
              onClick={() => showToast('Nenhuma nova notificação no momento.', 'info')}
              aria-label="Notificações"
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative transition"
            >
              <Bell className="w-5 h-5" />
              <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-2 right-2" />
            </button>
            <button
              onClick={() => navigateToTab('perfil')}
              aria-label="Perfil"
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* ====================================================================
            CONTEÚDO PRINCIPAL ROLÁVEL
           ==================================================================== */}
        <main className={`flex-1 px-3.5 pt-3.5 ${showNotices ? 'pb-56' : 'pb-24'}`}>
          {renderMainContent()}
        </main>

        {/* ====================================================================
            10. AVISOS FIXOS NO RODAPÉ (ACIMA DA BARRA DE NAVEGAÇÃO)
           ==================================================================== */}
        {showNotices && (
          <div className="fixed bottom-16 inset-x-0 w-full z-20 px-3 pb-2 pointer-events-none">
            <div className="pointer-events-auto space-y-1.5">
              <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg rounded-xl p-2.5 relative">
                <button
                  onClick={() => setShowNotices(false)}
                  aria-label="Fechar avisos"
                  className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="text-[10px] font-extrabold text-blue-900 uppercase">ATENÇÃO</div>
                <p className="text-[10px] text-slate-600 leading-snug pr-4 mt-0.5">
                  O GRUPO WHATSAPP ESTÁ SUSPENSO. NÃO SAIA DO GRUPO, FAÇA UMA NOVA SOLICITAÇÃO PARA INGRESSAR NO GRUPO TELEGRAM.
                </p>
              </div>

              <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg rounded-xl p-2.5">
                <div className="text-[10px] font-extrabold text-blue-900 uppercase">ATENÇÃO</div>
                <p className="text-[10px] text-slate-600 leading-snug mt-0.5">
                  O GRUPO ANTERIOR ESTÁ SUSPENSO, FAÇA UMA NOVA SOLICITAÇÃO PARA INGRESSAR NO NOVO GRUPO OFICIAL NEXUS AÇÕES.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            4. NAVEGAÇÃO INFERIOR FIXA (BOTTOM NAVIGATION BAR)
           ==================================================================== */}
        <nav className="fixed bottom-0 inset-x-0 w-full z-30 bg-white border-t border-slate-200/90 h-16 px-2 flex items-center justify-around shadow-[0_-4px_12px_rgba(15,23,42,0.05)]">
          {/* Início */}
          <button
            onClick={() => navigateToTab('inicio')}
            className={`flex flex-col items-center justify-center w-16 py-1 transition ${
              activeTab === 'inicio' && !subPage ? 'text-blue-900 font-extrabold' : 'text-slate-500 font-medium'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] mt-1">Início</span>
          </button>

          {/* Investir */}
          <button
            onClick={() => navigateToTab('investir')}
            className={`flex flex-col items-center justify-center w-16 py-1 transition ${
              activeTab === 'investir' && !subPage ? 'text-blue-900 font-extrabold' : 'text-slate-500 font-medium'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] mt-1">Investir</span>
          </button>

          {/* Depositar (Botão Central Elevado) */}
          <button
            onClick={() => navigateToTab('depositar')}
            className="flex flex-col items-center justify-center -mt-5"
          >
            <div
              className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white transition transform active:scale-95 ${
                activeTab === 'depositar' && !subPage
                  ? 'bg-gradient-to-br from-blue-800 to-cyan-600 text-white'
                  : 'bg-gradient-to-br from-blue-950 to-indigo-800 text-amber-300'
              }`}
            >
              <Wallet className="w-6 h-6" />
            </div>
            <span
              className={`text-[10px] mt-0.5 ${
                activeTab === 'depositar' && !subPage ? 'text-blue-900 font-extrabold' : 'text-slate-600 font-bold'
              }`}
            >
              Depositar
            </span>
          </button>

          {/* Equipe */}
          <button
            onClick={() => navigateToTab('equipe')}
            className={`flex flex-col items-center justify-center w-16 py-1 transition ${
              activeTab === 'equipe' && !subPage ? 'text-blue-900 font-extrabold' : 'text-slate-500 font-medium'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-1">Equipe</span>
          </button>

          {/* Perfil */}
          <button
            onClick={() => navigateToTab('perfil')}
            className={`flex flex-col items-center justify-center w-16 py-1 transition ${
              activeTab === 'perfil' && !subPage ? 'text-blue-900 font-extrabold' : 'text-slate-500 font-medium'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-1">Perfil</span>
          </button>
        </nav>

        {/* ====================================================================
            DRAWER LATERAL (MENU HAMBÚRGUER)
           ==================================================================== */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-center bg-slate-950/60 backdrop-blur-xs">
            <div className="w-full max-w-md flex">
              <div className="w-72 bg-white h-full shadow-2xl p-5 flex flex-col justify-between animate-slideRight">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-amber-300">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <span className="font-black text-base text-slate-900">NEXUS AÇÕES</span>
                    </div>
                    <button
                      onClick={() => setDrawerOpen(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-1">
                    {[
                      { label: 'Tela Inicial', icon: Home, action: () => navigateToTab('inicio') },
                      { label: 'Planos de Ações', icon: TrendingUp, action: () => navigateToTab('investir') },
                      { label: 'Adicionar Saldo (PIX)', icon: Wallet, action: () => navigateToTab('depositar') },
                      { label: 'Solicitar Saque', icon: ArrowUpRight, action: () => { setDrawerOpen(false); setSubPage('withdraw'); } },
                      { label: 'Clube VIP', icon: Crown, action: () => { setDrawerOpen(false); setSubPage('vip'); } },
                      { label: 'Minha Equipe', icon: Users, action: () => navigateToTab('equipe') },
                      { label: 'Curso da Plataforma', icon: BookOpen, action: () => { setDrawerOpen(false); setSubPage('course'); } },
                      { label: 'Insígnias & Bônus', icon: Award, action: () => { setDrawerOpen(false); setSubPage('badges'); } }
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          onClick={item.action}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-900 transition"
                        >
                          <Icon className="w-4 h-4 text-blue-800" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
                  <div>ID: {user.id} • UID: {user.uid}</div>
                  <div className="mt-0.5">NEXUS AÇÕES © 2026</div>
                  <button onClick={onSignOut} className="mt-3 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">Sair da conta</button>
                </div>
              </div>
              <div className="flex-1" onClick={() => setDrawerOpen(false)} />
            </div>
          </div>
        )}

        {/* ====================================================================
            2. MODAL DE BOAS-VINDAS (POPUP INICIAL)
           ==================================================================== */}
        {showWelcomeModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-slate-200 animate-scaleIn">
              {/* Banner Corporativo NEXUS AÇÕES */}
              <div className="relative h-44 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-5 flex flex-col justify-between overflow-hidden">
                <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 400 180" preserveAspectRatio="none">
                  <path
                    d="M0,140 Q80,120 140,90 T280,50 T400,15 L400,180 L0,180 Z"
                    fill="#38bdf8"
                  />
                </svg>

                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
                    <Crown className="w-3 h-3" /> PLATAFORMA OFICIAL
                  </span>
                  <button
                    onClick={() => setShowWelcomeModal(false)}
                    className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center shadow-md">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-black text-base tracking-wide">NEXUS AÇÕES</div>
                    <div className="text-cyan-200 text-[11px]">Gestão Inteligente de Ativos</div>
                  </div>
                </div>
              </div>

              {/* Corpo do Modal */}
              <div className="p-5">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                  NEXUS AÇÕES
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5 nexus-title">
                  Bem-vindo à NEXUS AÇÕES
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Seu investimento gera rendimento diário e pontos para a rede.
                </p>

                <ul className="text-xs text-slate-600 space-y-1.5 mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <li>• Escolha um plano na tela inicial.</li>
                  <li>• Use os botões abaixo para o suporte e o grupo.</li>
                </ul>

                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => showToast('Redirecionando para o canal oficial da NEXUS AÇÕES...', 'info')}
                    className="w-full py-3 rounded-xl bg-blue-50 text-blue-900 border border-blue-200 font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-100 transition"
                  >
                    <span>Grupo no WhatsApp / Telegram</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setShowWelcomeModal(false)}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-800 text-white font-extrabold text-sm shadow-md hover:opacity-95 transition"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================
            MODAL DE PAGAMENTO PIX GERADO
           ==================================================================== */}
        {pixModalData && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-blue-700">PAGAMENTO INSTANTÂNEO</span>
                  <h3 className="text-lg font-extrabold text-slate-900 nexus-title">PIX NEXUS AÇÕES</h3>
                </div>
                <button
                  onClick={() => setPixModalData(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center">
                <div className="text-xs text-slate-500">Valor a pagar</div>
                <div className="text-2xl font-black text-blue-900 my-1">
                  {formatBRL(pixModalData.amount)}
                </div>

                {pixModalData.code ? (
                  <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3">
                    <img
                      src={`https://quickchart.io/qr?text=${encodeURIComponent(pixModalData.code)}&size=220&margin=2`}
                      alt="QR Code do PIX para pagamento"
                      className="mx-auto h-52 w-52 max-w-full"
                    />
                    <p className="mt-2 text-center text-[10px] font-semibold text-slate-500">Escaneie o QR Code no aplicativo do banco</p>
                  </div>
                ) : null}
                <div className="w-full rounded-xl border border-blue-100 bg-blue-50 p-3 text-center text-xs text-blue-900">
                  {pixModalData.code
                    ? 'Código PIX disponibilizado. Copie e pague no aplicativo do seu banco.'
                    : 'Pedido enviado à administração. O código PIX aparecerá aqui assim que for inserido no painel.'}
                </div>
                <div className="w-full mt-2">
                  <div className="text-[10px] font-bold text-slate-500 mb-1">Código PIX Copia e Cola</div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={pixModalData.code || 'Aguardando código PIX...'}
                      className="w-full text-[11px] bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-600 truncate"
                    />
                    <button
                      disabled={!pixModalData.code}
                      onClick={() => handleCopy(pixModalData.code, 'Código PIX copiado')}
                      className="px-3 py-2 rounded-lg bg-blue-900 text-white text-xs font-bold shrink-0 disabled:opacity-40"
                    >
                      Copiar
                    </button>
                  </div>
                  {pixModalData.status === 'paid' ? <p className="mt-3 text-xs font-bold text-emerald-700">Depósito confirmado pela administração.</p> : null}
                  {pixModalData.status === 'rejected' ? <p className="mt-3 text-xs font-bold text-rose-700">Pedido de depósito recusado. Entre em contato com o suporte.</p> : null}
                </div>
              </div>

              <button
                onClick={handleConfirmPixSimulation}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-md hover:opacity-95 transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Fechar / acompanhar pedido</span>
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            NOTIFICAÇÃO TOAST FLUTUANTE
           ==================================================================== */}
        {toast && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm pointer-events-none">
            <div
              className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2.5 ${
                toast.type === 'error'
                  ? 'bg-rose-950 text-white border-rose-800'
                  : toast.type === 'warning'
                  ? 'bg-amber-950 text-amber-100 border-amber-700'
                  : 'bg-emerald-950 text-white border-emerald-500/60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Autenticação real: o painel só é exibido após sessão Firebase válida.
export default function App() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (!auth) {
      setAuthReady(true);
      return undefined;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setFirebaseUser(currentUser);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    if (auth) await signOut(auth);
  };

  if (!firebaseConfigured || !auth) {
    return <AuthScreen configurationMissing />;
  }
  if (!authReady) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Carregando NEXUS AÇÕES...</div>;
  }
  if (!firebaseUser) {
    return <AuthScreen />;
  }
  if (window.location.pathname === '/admin') return <AdminPanel firebaseUser={firebaseUser} />;
  return <Dashboard firebaseUser={firebaseUser} onSignOut={handleSignOut} />;
}
