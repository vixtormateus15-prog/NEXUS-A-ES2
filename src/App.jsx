import React, { useState, useEffect, useRef } from 'react';
import { getIdTokenResult, onAuthStateChanged, signOut } from 'firebase/auth';
import { get, onValue, ref, runTransaction, set, update } from 'firebase/database';
import { auth, database, firebaseConfigured } from './firebase';
import AuthScreen from './AuthScreen.jsx';
import AdminPanel from './AdminPanel.jsx';
import SupportChat from './SupportChat.jsx';
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
    description: 'Tema imobiliário e de renda fixa: referências a imóveis, recebíveis e títulos. Cada modalidade possui riscos e oscilações próprios.',
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
    description: 'Tema de tecnologia: setor de chips, infraestrutura digital e inteligência artificial, áreas sujeitas a mudanças rápidas de mercado.',
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
    description: 'Tema do agronegócio: produção rural, cadeia de alimentos, exportação e soluções agrícolas sustentáveis.',
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
    description: 'Tema industrial: infraestrutura, fábricas, transporte e logística, segmentos ligados à atividade econômica.',
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
    description: 'Tema de energia: geração solar, fontes renováveis e transição energética, com riscos regulatórios e de mercado.',
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
    description: 'Tema de ativos digitais: blockchain e criptoativos, mercado conhecido por alta volatilidade e riscos elevados.',
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
    description: 'Tema global: índices de mercados internacionais e variações cambiais, influenciados por fatores econômicos mundiais.',
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
    description: 'Tema de mercados sofisticados: serviços financeiros, estratégias quantitativas e negociação eletrônica.',
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
    desc: 'Escolha um plano na vitrine, confira os valores projetados e envie o pedido. O administrador confere o saldo e aprova a ativação pelo painel.',
    highlight: 'Planos a partir de R$ 35,00'
  },
  {
    step: 4,
    title: 'Como Adicionar Saldo (PIX)',
    desc: 'Toque no botão central "Depositar", escolha um valor rápido ou digite entre R$ 35,00 e R$ 5.000,00 e consulte as condições de crédito disponíveis.',
    highlight: 'Confirmação Manual'
  },
  {
    step: 5,
    title: 'Onde Ficam os Planos Ativos',
    desc: 'Acesse a aba "Investir" no menu inferior e selecione "Iniciado" para acompanhar o progresso diário e o tempo restante de cada cota.',
    highlight: 'Monitoramento em Tempo Real'
  },
  {
    step: 6,
    title: 'Como acompanhar os valores previstos',
    desc: 'Os valores exibidos são projeções ilustrativas. Não há crédito automático: a administração confere cada pagamento e registra manualmente apenas os valores efetivamente pagos.',
    highlight: 'Créditos Manuais'
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
    desc: 'Vá em "Retirada", cadastre sua chave PIX (CPF, Telefone ou E-mail) e informe o valor a partir de R$ 10,00. A taxa operacional é de 6%, exibida antes de confirmar.',
    highlight: 'Saque Rápido via PIX'
  },
  {
    step: 9,
    title: 'Programa de Indicação (Equipe)',
    desc: 'Compartilhe seu código exclusivo ou link de convite na aba "Equipe". Acompanhe os cadastros diretos e avance pelos quatro níveis de participação conforme a quantidade de convidados.',
    highlight: 'Quatro níveis de participação'
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
      <img src={plan.image} alt={`Imagem ilustrativa de ${plan.subtitle}`} className="plan-banner-image absolute inset-0 w-full h-full object-cover brightness-125 saturate-150 contrast-110 scale-[1.03] transition-transform duration-700" loading="lazy" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-slate-950/75 via-slate-950/35 to-slate-950/10" />
      <div className="plan-banner-glow absolute z-[2] -right-10 -top-12 w-52 h-52 rounded-full bg-cyan-300/40 blur-3xl" />
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
            <span className="text-[8px] font-extrabold text-emerald-300">PROJ.</span>
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
  const [withdrawalBusy, setWithdrawalBusy] = useState(false);
  const [withdrawalProfile, setWithdrawalProfile] = useState(null);
  const [withdrawalProfileLoaded, setWithdrawalProfileLoaded] = useState(false);
  const [pixProfileBusy, setPixProfileBusy] = useState(false);
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
  const [investmentRequests, setInvestmentRequests] = useState([]);
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
  const [depositAmount, setDepositAmount] = useState('15');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [tempPixType, setTempPixType] = useState('CPF');
  const [tempPixKey, setTempPixKey] = useState('');
  const [withdrawCpf, setWithdrawCpf] = useState('');
  const [withdrawHolderName, setWithdrawHolderName] = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [teamSearch, setTeamSearch] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [showInviteShareModal, setShowInviteShareModal] = useState(false);
  const [guideStepIndex, setGuideStepIndex] = useState(0);
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });

  // Cria o código individual e vincula o novo cadastro ao convite informado.
  // Os níveis são de participação; não geram comissões sobre depósitos ou rendimentos.
  useEffect(() => {
    if (!database || !firebaseUser?.uid) return undefined;
    let active = true;
    const uid = firebaseUser.uid;
    const profileRef = ref(database, `profiles/${uid}`);
    const displayName = firebaseUser.displayName || (firebaseUser.email || '').split('@')[0] || 'Membro Nexus';
    (async () => {
      const snapshot = await get(profileRef);
      const oldProfile = snapshot.exists() ? (snapshot.val() || {}) : {};
      const inviteCode = oldProfile.inviteCode || `NX${uid.slice(0, 8).toUpperCase()}`;
      let referrerUid = oldProfile.referrerUid || '';
      const pendingCode = String(localStorage.getItem('nexus_pending_invite_code') || new URLSearchParams(window.location.search).get('code') || new URLSearchParams(window.location.search).get('ref') || '').trim().toUpperCase();
      let inviterCode = '';
      if (!referrerUid && pendingCode && pendingCode !== inviteCode) {
        const inviterSnapshot = await get(ref(database, `inviteCodes/${pendingCode}`));
        if (inviterSnapshot.exists()) {
          const inviter = inviterSnapshot.val() || {};
          if (inviter.uid && inviter.uid !== uid) { referrerUid = inviter.uid; inviterCode = pendingCode; }
        }
      }
      const profileData = { email: firebaseUser.email || '', displayName: oldProfile.displayName || displayName, createdAt: Number(oldProfile.createdAt || Date.now()), inviteCode, ...(referrerUid ? { referrerUid } : {}) };
      if (!snapshot.exists()) await set(profileRef, profileData);
      else await update(profileRef, { email: profileData.email, displayName: profileData.displayName, inviteCode, ...(referrerUid && !oldProfile.referrerUid ? { referrerUid } : {}) });

      // Bônus único de boas-vindas para contas recém-criadas.
      // A janela curta é confirmada também pelas regras do Realtime Database.
      try {
        const now = Date.now();
        const profileIsNew = now - Number(profileData.createdAt || 0) <= 24 * 60 * 60 * 1000;
        const tokenResult = await getIdTokenResult(firebaseUser);
        const authTime = Number(tokenResult.claims.auth_time || 0) * 1000;
        const sessionIsNew = authTime > 0 && now - authTime <= 10 * 60 * 1000;
        if (profileIsNew && sessionIsNew) {
          const walletRef = ref(database, `wallets/${uid}`);
          const bonusResult = await runTransaction(walletRef, (current) => {
            const wallet = current || {};
            if (wallet.signupBonusGranted === true) return;
            return {
              ...wallet,
              withdrawableBalance: Number((Number(wallet.withdrawableBalance || 0) + 3.50).toFixed(2)),
              signupBonusGranted: true,
              signupBonusAmount: 3.50,
              signupBonusAt: Date.now()
            };
          }, { applyLocally: false });
          if (bonusResult.committed) showToast('Bônus de cadastro de R$ 3,50 creditado no seu saldo interno!', 'success');
        }
      } catch (bonusError) {
        console.error('Não foi possível creditar o bônus de cadastro:', bonusError);
      }
      if (!snapshot.exists()) await set(profileRef, profileData);
      else await update(profileRef, { email: profileData.email, displayName: profileData.displayName, inviteCode, ...(referrerUid && !oldProfile.referrerUid ? { referrerUid } : {}) });
      const codeRef = ref(database, `inviteCodes/${inviteCode}`);
      const codeSnapshot = await get(codeRef);
      if (!codeSnapshot.exists()) await set(codeRef, { uid, createdAt: Date.now() });
      if (referrerUid && inviterCode && !oldProfile.referrerUid) {
        await set(ref(database, `referralsBySponsor/${referrerUid}/${uid}`), { memberUid: uid, sponsorUid: referrerUid, referralCode: inviterCode, displayName, createdAt: Date.now() });
      }
      localStorage.removeItem('nexus_pending_invite_code');
      if (!active) return;
      setUser((prev) => ({ ...prev, email: profileData.email, id: profileData.displayName || prev.id, inviteCode, referrerUid }));
    })().catch((error) => { console.error('Falha ao configurar código de convite:', error); if (active) showProfileError(); });
    return () => { active = false; };
  }, [firebaseUser.uid]);

  // Lista somente os convites diretos do titular autenticado.
  useEffect(() => {
    if (!database || !firebaseUser?.uid) return undefined;
    return onValue(ref(database, `referralsBySponsor/${firebaseUser.uid}`), (snapshot) => {
      const raw = snapshot.val() || {};
      setTeamMembers(Object.entries(raw).map(([uid, item]) => ({ uid, ...(item || {}) })).sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0)));
    }, (error) => console.error('Falha ao carregar indicações:', error));
  }, [firebaseUser.uid]);

  // Carrega os dados fixos do titular e a chave PIX salva para saques.
  useEffect(() => {
    if (!database || !firebaseUser?.uid) return undefined;
    return onValue(ref(database, 'withdrawalProfiles/' + firebaseUser.uid), (snapshot) => {
      const profile = snapshot.exists() ? snapshot.val() : null;
      setWithdrawalProfile(profile);
      setWithdrawalProfileLoaded(true);
      if (profile) {
        setWithdrawCpf(String(profile.cpf || ''));
        setWithdrawHolderName(String(profile.holderName || ''));
        setTempPixType(profile.pixKeyType || 'CPF');
        setTempPixKey(profile.pixKey || '');
      }
    }, () => setWithdrawalProfileLoaded(true));
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

  // Histórico de saques sincronizado com os pedidos enviados ao painel.
  useEffect(() => {
    if (!database || !firebaseUser?.uid) return undefined;
    return onValue(ref(database, 'withdrawalRequestsByUser/' + firebaseUser.uid), (snapshot) => {
      const raw = snapshot.val() || {};
      const history = Object.entries(raw).map(([id, item]) => ({
        id, amount: Number(item?.amount || 0), net: Number(item?.netAmount ?? item?.amount ?? 0),
        pixKey: item?.pixKey || '', holderName: item?.holderName || item?.name || '',
        status: ({ pending: 'Em processamento', approved: 'SAQUE BEM SUCEDIDO', paid: 'Pago', rejected: 'Recusado' }[item?.status] || item?.status || 'Em processamento'),
        createdAt: Number(item?.createdAt || 0),
        date: item?.createdAt ? new Date(Number(item.createdAt)).toLocaleString('pt-BR') : '—'
      })).sort((a,b)=>b.createdAt-a.createdAt);
      setWithdrawHistory(history);
    }, (error) => console.error('Falha ao carregar histórico de saques:', error));
  }, [firebaseUser.uid]);

  // Pedidos de ativação aguardam aprovação manual do administrador.
  useEffect(() => {
    if (!database || !firebaseUser?.uid) return undefined;
    return onValue(ref(database, 'investmentRequestsByUser/' + firebaseUser.uid), (snapshot) => {
      const raw = snapshot.val() || {};
      setInvestmentRequests(Object.entries(raw).map(([id, item]) => ({ id, ...(item || {}) }))
        .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0)));
    }, (error) => console.error('Falha ao carregar pedidos de investimento:', error));
  }, [firebaseUser.uid]);

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
  }, [walletData.investments, checkinClock]);

  useEffect(() => {
    const all = Object.values(walletData.investments || {}).filter((item) => item && item.instanceId);
    setPlans(INITIAL_PLANS.map((plan) => ({ ...plan, bought: all.filter((item) => item.planId === plan.id).length })));
  }, [walletData.investments]);

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

  // O cliente apenas solicita a ativação. O administrador confere o saldo e aprova no painel.
  const handleInvestPlan = async (plan) => {
    if (!database || !firebaseUser?.uid || investmentBusy) {
      showToast('Não foi possível conectar ao sistema de investimentos.', 'error');
      return;
    }
    if (Number(user.depositBalance || 0) < Number(plan.price || 0)) {
      showToast('Saldo insuficiente. Faça um depósito e aguarde a confirmação no painel.', 'warning');
      setSubPage(null);
      setActiveTab('depositar');
      setDepositAmount(String(plan.price));
      return;
    }
    if (investmentRequests.some((item) => item.planId === plan.id && item.status === 'pending')) {
      showToast('Você já possui um pedido deste plano aguardando aprovação.', 'info');
      setActiveTab('investir');
      setInvestSubTab('iniciado');
      return;
    }
    setInvestmentBusy(true);
    try {
      const requestId = `${firebaseUser.uid.slice(0, 8)}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const requestData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: user.name || user.displayName || '',
        planId: plan.id,
        planName: plan.name,
        price: Number(plan.price),
        dailyReturn: Number(plan.dailyReturn),
        days: Number(plan.days),
        limit: Number(plan.limit),
        status: 'pending',
        createdAt: Date.now()
      };
      await update(ref(database), {
        ['investmentRequests/' + requestId]: requestData,
        ['investmentRequestsByUser/' + firebaseUser.uid + '/' + requestId]: requestData
      });
      showToast('Pedido enviado. O plano será ativado após a conferência e aprovação no painel.', 'success');
      setSubPage(null);
      setActiveTab('investir');
      setInvestSubTab('iniciado');
    } catch (error) {
      showToast('Não foi possível enviar o pedido: ' + (error?.message || 'verifique sua conexão.'), 'error');
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
    if (!Number.isFinite(val) || val < 15 || val > 5000) {
      showToast('Informe um valor entre R$ 15,00 e R$ 5.000,00.', 'error');
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

  // Salva o cadastro do titular uma única vez; depois permite alterar somente a chave PIX.
  const handleSavePixKey = async (e) => {
    e.preventDefault();
    if (pixProfileBusy) return;
    const pixKey = tempPixKey.trim();
    if (!pixKey) { showToast('Digite uma chave PIX válida.', 'error'); return; }
    if (tempPixType === 'CPF' && pixKey.replace(/\D/g, '').length !== 11) { showToast('A chave PIX CPF deve conter 11 números.', 'error'); return; }
    if (tempPixType === 'E-mail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pixKey)) { showToast('Informe um e-mail válido como chave PIX.', 'error'); return; }
    if (tempPixType === 'Telefone' && !/^\+?[0-9()\s-]{10,20}$/.test(pixKey)) { showToast('Informe um número de celular válido como chave PIX.', 'error'); return; }
    if (!database || !firebaseUser?.uid) { showToast('Cadastro de saque indisponível.', 'error'); return; }

    setPixProfileBusy(true);
    try {
      const profileRef = ref(database, 'withdrawalProfiles/' + firebaseUser.uid);
      if (withdrawalProfile) {
        await update(profileRef, { pixKeyType: tempPixType, pixKey });
      } else {
        const cpf = withdrawCpf.replace(/\D/g, '');
        const holderName = withdrawHolderName.trim();
        if (cpf.length !== 11) { showToast('Informe o CPF do titular com 11 números.', 'error'); return; }
        if (!holderName) { showToast('Informe o nome completo do titular da conta.', 'error'); return; }
        await set(profileRef, {
          uid: firebaseUser.uid, cpf, holderName, pixKeyType: tempPixType,
          pixKey, createdAt: Date.now(), updatedAt: Date.now()
        });
      }
      showToast(withdrawalProfile ? 'Chave PIX atualizada. CPF e titular continuam bloqueados.' : 'Dados do titular cadastrados e salvos. CPF e titular não poderão ser alterados.', 'success');
      setSubPage('withdraw');
    } catch (error) {
      showToast('Não foi possível salvar os dados: ' + (error?.message || 'verifique as regras do Firebase.'), 'error');
    } finally {
      setPixProfileBusy(false);
    }
  };

  // O cliente registra uma solicitação; o painel confere e reserva o saldo ao aprovar.
  const handleRequestWithdraw = async () => {
    if (withdrawalBusy) return;
    if (Object.keys(walletData.investments || {}).length === 0) {
      showToast('Ative pelo menos um plano antes de solicitar saque.', 'warning');
      return;
    }
    const val = Number(String(withdrawAmount).replace(',', '.'));
    if (!Number.isFinite(val) || val < 10) { showToast('O valor mínimo para saque é de R$ 10,00.', 'error'); return; }
    const totalAvailable = Number(walletData.withdrawableBalance || 0) + Number(walletData.depositBalance || 0);
    if (val > totalAvailable) { showToast(`Saldo total insuficiente. Disponível: ${formatBRL(totalAvailable)} (depósitos + bônus + check-ins).`, 'error'); return; }
    if (withdrawHistory.some((item) => item.status === 'Pendente' || item.status === 'Aprovado')) {
      showToast('Você já possui um saque em análise. Aguarde a conclusão.', 'warning'); return;
    }
    if (!withdrawalProfile) { showToast('Cadastre primeiro o CPF, o titular e a chave PIX.', 'warning'); setSubPage('pix-method'); return; }
    const cpfDigits = String(withdrawalProfile.cpf || '');
    const holderName = String(withdrawalProfile.holderName || '');
    const pixKey = String(withdrawalProfile.pixKey || '').trim();
    const pixKeyType = withdrawalProfile.pixKeyType || 'CPF';
    if (cpfDigits.length !== 11 || !holderName || !pixKey) { showToast('Confira seu cadastro de saque antes de continuar.', 'warning'); setSubPage('pix-method'); return; }
    if (!pixKey) { showToast('Informe a chave PIX que receberá o saque.', 'error'); return; }
    if (pixKeyType === 'CPF' && pixKey.replace(/\D/g, '').length !== 11) { showToast('A chave PIX CPF cadastrada é inválida. Atualize-a.', 'error'); setSubPage('pix-method'); return; }
    if (pixKeyType === 'E-mail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pixKey)) { showToast('A chave PIX cadastrada é inválida. Atualize-a.', 'error'); setSubPage('pix-method'); return; }
    if (pixKeyType === 'Telefone' && !/^\+?[0-9()\s-]{10,20}$/.test(pixKey)) { showToast('A chave PIX cadastrada é inválida. Atualize-a.', 'error'); setSubPage('pix-method'); return; }
    if (!database || !firebaseUser?.uid) { showToast('Sistema de saques indisponível.', 'error'); return; }

    setWithdrawalBusy(true);
    try {
      const requestId = `${firebaseUser.uid.slice(0, 8)}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      const amount = Number(val.toFixed(2));
      const requestData = {
        uid: firebaseUser.uid, email: firebaseUser.email || '',
        name: holderName, cpf: cpfDigits, holderName,
        pixKeyType, pixKey, amount,
        feeAmount: Number((amount * 0.06).toFixed(2)),
        netAmount: Number((amount * 0.94).toFixed(2)),
        status: 'pending', createdAt: Date.now()
      };
      await update(ref(database), {
        ['withdrawalRequests/' + requestId]: requestData,
        ['withdrawalRequestsByUser/' + firebaseUser.uid + '/' + requestId]: requestData
      });
      showToast('Solicitação enviada e em processamento. Acompanhe o status no histórico de saques.', 'success');
      setWithdrawAmount('');
    } catch (error) {
      showToast('Não foi possível enviar sua solicitação: ' + (error?.message || 'verifique sua conexão.'), 'error');
    } finally {
      setWithdrawalBusy(false);
    }
  };

  // ==========================================================================
  // COMPONENTE REUTILIZÁVEL: CARTÃO DE RESUMO DO USUÁRIO
  // ==========================================================================

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
    <section className="relative isolate mb-4 overflow-hidden rounded-[2rem] border border-blue-300/30 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-4 shadow-2xl shadow-blue-950/25">
      {/* Brilhos e elementos abstratos animados ao fundo */}
      <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-20 -left-12 h-52 w-52 rounded-full bg-indigo-500/30 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute right-8 top-8 h-28 w-28 rounded-full border border-cyan-200/15 animate-spin" style={{ animationDuration: '24s' }} />
      <div className="pointer-events-none absolute right-12 top-12 h-20 w-20 rounded-full border border-dashed border-blue-200/20 animate-spin" style={{ animationDuration: '18s', animationDirection: 'reverse' }} />
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-20" viewBox="0 0 400 340" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-20 260 L65 220 L120 238 L190 160 L255 180 L330 92 L430 112" fill="none" stroke="#67e8f9" strokeWidth="1.5" strokeDasharray="5 8" />
        <path d="M-10 292 L70 252 L130 270 L200 192 L265 212 L340 124 L420 144" fill="none" stroke="#818cf8" strokeWidth="1" />
        <circle cx="330" cy="92" r="4" fill="#a5f3fc" />
        <circle cx="190" cy="160" r="3" fill="#a5f3fc" />
      </svg>

      <div className="relative z-10">
        <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/30 bg-gradient-to-br from-cyan-300 via-blue-500 to-indigo-600 text-2xl font-black text-white shadow-lg shadow-cyan-950/40">
              N
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-blue-950 bg-emerald-400 shadow-md" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-200">NEXUS AÇÕES</div>
              <div className="mt-0.5 truncate text-lg font-black leading-tight text-white">{user.id}</div>
              <button
                onClick={() => handleCopy(user.uid, 'UID copiado')}
                className="mt-1 flex max-w-full items-center gap-1.5 text-[11px] font-medium text-blue-100/75 transition hover:text-cyan-200"
              >
                <span className="truncate">UID: {user.uid}</span>
                <Copy className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
              </button>
            </div>
          </div>

          <button
            onClick={() => setSubPage('vip')}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-amber-300/50 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 px-3 py-2 text-xs font-black text-amber-950 shadow-lg shadow-amber-950/30 transition hover:brightness-110 active:scale-95"
          >
            <Crown className="h-4 w-4 fill-amber-700 text-amber-800" />
            <span>VIP {user.vipLevel}</span>
          </button>
        </div>

        <div className="mb-3 mt-4 flex items-center justify-between gap-2">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-white">Visão geral da carteira</div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-emerald-200">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
            Dados da conta
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="relative overflow-hidden rounded-2xl border border-blue-200/25 bg-gradient-to-br from-blue-500/25 to-blue-950/50 p-3.5 shadow-lg">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-blue-300/15 blur-xl" />
            <div className="relative flex items-center gap-2 text-xs font-bold text-blue-100"><Wallet className="h-4 w-4 text-cyan-200" /> Saldo</div>
            <div className="relative mt-2 text-xl font-black tracking-tight text-white">{formatBRL(user.depositBalance)}</div>
            <div className="relative mt-1 text-[10px] leading-snug text-blue-100/75">Saldo para solicitar ativação de planos</div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-emerald-200/25 bg-gradient-to-br from-emerald-400/25 to-teal-950/50 p-3.5 shadow-lg">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-emerald-300/15 blur-xl" />
            <div className="relative flex items-center gap-2 text-xs font-bold text-emerald-100"><ArrowUpRight className="h-4 w-4 text-emerald-200" /> Pode ser retirado</div>
            <div className="relative mt-2 text-xl font-black tracking-tight text-white">{formatBRL(user.withdrawableBalance)}</div>
            <div className="relative mt-1 text-[10px] leading-snug text-emerald-100/75">Créditos confirmados e disponíveis</div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-violet-200/25 bg-gradient-to-br from-violet-400/25 to-indigo-950/50 p-3.5 shadow-lg">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-violet-300/15 blur-xl" />
            <div className="relative flex items-center gap-2 text-xs font-bold text-violet-100"><Sparkles className="h-4 w-4 text-violet-200" /> Pontos Nexus</div>
            <div className="relative mt-2 text-xl font-black tracking-tight text-white">{user.nexusPoints.toFixed(2).replace('.', ',')}</div>
            <div className="relative mt-1 text-[10px] leading-snug text-violet-100/75">Pontos acumulados na plataforma</div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-amber-200/25 bg-gradient-to-br from-amber-400/25 to-amber-950/50 p-3.5 shadow-lg">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-amber-300/15 blur-xl" />
            <div className="relative flex items-center gap-2 text-xs font-bold text-amber-100"><Award className="h-4 w-4 text-amber-200" /> Remuneração</div>
            <div className="relative mt-2 text-xl font-black tracking-tight text-white">{formatBRL(user.commissionBalance)}</div>
            <div className="relative mt-1 text-[10px] leading-snug text-amber-100/75">Comissões registradas na sua conta</div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-[11px] leading-relaxed text-blue-100/85 backdrop-blur-sm">
          <span className="font-extrabold text-cyan-200">Como entender seus valores:</span> o saldo é usado nos pedidos de planos; o valor retirável reúne créditos confirmados e liberados; pontos e remuneração são indicadores separados. Consulte cada seção para ver regras e movimentações.
        </div>
      </div>
    </section>
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
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{currentPlan.description}</p>
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
                <div className="text-[11px] font-bold uppercase tracking-wide text-emerald-800">Resumo do ciclo</div>
                <div className="text-xl font-black text-emerald-700 mt-0.5">+{((totalReturn / currentPlan.price) * 100).toFixed(1).replace('.', ',')}%</div>
                <div className="text-xs font-semibold text-emerald-800">{formatBRL(totalReturn)} em {currentPlan.days} dias</div>
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
          <button onClick={() => setSubPage('withdraw')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-900 py-1"><ChevronLeft className="w-4 h-4"/><span>Voltar</span></button>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-800"><CreditCard className="w-6 h-6"/></div>
            <div><h2 className="text-lg font-extrabold text-slate-900 nexus-title">Dados para saque</h2><p className="text-xs text-slate-500">Seus dados ficam salvos para as próximas retiradas.</p></div>
          </div>
          {!withdrawalProfileLoaded ? <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-900">Carregando cadastro...</div> : null}
          <form onSubmit={handleSavePixKey} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-4">
            <div><label className="block text-xs font-extrabold text-slate-800 mb-1.5">CPF do titular</label><input type="text" inputMode="numeric" maxLength={11} disabled={Boolean(withdrawalProfile)} value={withdrawCpf} onChange={e=>setWithdrawCpf(e.target.value.replace(/[^0-9]/g,'').slice(0,11))} placeholder="Digite os 11 números do CPF" className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm disabled:bg-slate-100 disabled:text-slate-500" required/><p className="mt-1 text-[11px] text-slate-500">{withdrawalProfile ? 'CPF cadastrado e bloqueado para edição.' : 'Confira com atenção: após salvar, não poderá ser alterado.'}</p></div>
            <div><label className="block text-xs font-extrabold text-slate-800 mb-1.5">Nome completo do titular</label><input type="text" autoComplete="name" disabled={Boolean(withdrawalProfile)} value={withdrawHolderName} onChange={e=>setWithdrawHolderName(e.target.value)} placeholder="Nome exatamente como consta no banco" className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm disabled:bg-slate-100 disabled:text-slate-500" required/><p className="mt-1 text-[11px] text-slate-500">{withdrawalProfile ? 'Titular cadastrado e bloqueado para edição.' : 'Após salvar, somente a chave PIX poderá ser alterada.'}</p></div>
            <div><label className="block text-xs font-extrabold text-slate-800 mb-1.5">Tipo de chave PIX</label><div className="grid grid-cols-3 gap-2">{pixTypes.map(type=><button type="button" key={type} onClick={()=>setTempPixType(type)} className={'rounded-xl border px-2 py-3 text-xs font-bold '+(tempPixType===type?'border-blue-800 bg-blue-50 text-blue-900':'border-slate-200 text-slate-600')}>{type}</button>)}</div></div>
            <div><label className="block text-xs font-extrabold text-slate-800 mb-1.5">Chave PIX</label><input type="text" value={tempPixKey} onChange={e=>setTempPixKey(e.target.value)} placeholder={'Digite sua chave '+tempPixType} className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-sm" required/></div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">{withdrawalProfile ? 'Você pode alterar somente a chave PIX. O CPF e o nome do titular permanecem fixos.' : 'Confira o CPF e o nome antes de salvar. Esses dois dados ficarão bloqueados; depois você poderá alterar apenas a chave PIX.'}</div>
            <button type="submit" disabled={pixProfileBusy || !withdrawalProfileLoaded} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-800 text-white font-bold text-sm shadow-md disabled:opacity-50">{pixProfileBusy ? 'Salvando...' : withdrawalProfile ? 'Salvar nova chave PIX' : 'Salvar cadastro'}</button>
          </form>
        </div>
      );
    }

    // ------------------------------------------------------------------------
    // SUB-PÁGINA: RETIRADA (SAQUE)
    // ------------------------------------------------------------------------
    if (subPage === 'withdraw') {
      const numericWithdraw = parseFloat(withdrawAmount) || 0;
      const feeValue = Number((Math.max(0, numericWithdraw) * 0.06).toFixed(2));
      const receiveValue = Math.max(0, Number((numericWithdraw - feeValue).toFixed(2)));
      const availableForDisplay = Number(walletData.withdrawableBalance || 0) + Number(walletData.depositBalance || 0);

      return (
        <div className="space-y-4 pb-4">
          <button
            onClick={() => setSubPage(null)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-blue-900 shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Voltar ao painel</span>
          </button>

          <div className="relative isolate overflow-hidden rounded-[26px] bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-5 text-white shadow-xl shadow-blue-950/15">
            <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-indigo-400/20 blur-3xl" />
            <div className="relative">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-cyan-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                  Área de retirada
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-cyan-200 shadow-inner">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
              <h2 className="text-2xl font-black tracking-tight">Seu saque, em um só lugar</h2>
              <p className="mt-2 max-w-sm text-xs leading-relaxed text-blue-100/85">
                Confira seus dados PIX, informe o valor desejado e acompanhe a solicitação pelo histórico.
              </p>
              <div className="mt-5 rounded-2xl border border-white/15 bg-white/[0.08] p-4 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-200">Saldo exibido para solicitação</p>
                <p className="mt-1 text-3xl font-black tracking-tight tabular-nums">{formatBRL(availableForDisplay)}</p>
                <div className="mt-3 flex items-center gap-2 text-[10px] font-medium text-cyan-100/90">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  Valores e pedidos sincronizados com sua conta
                </div>
              </div>
            </div>
          </div>

          <UserSummaryCard />

          <div className={`flex items-start gap-3 rounded-2xl border p-4 text-xs leading-relaxed shadow-sm ${Object.keys(walletData.investments || {}).length > 0 ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-white text-emerald-900' : 'border-amber-200 bg-gradient-to-r from-amber-50 to-white text-amber-900'}`}>
            <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${Object.keys(walletData.investments || {}).length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-extrabold">{Object.keys(walletData.investments || {}).length > 0 ? 'Condição de saque identificada' : 'Ativação de plano necessária'}</p>
              <p className="mt-1">
                {Object.keys(walletData.investments || {}).length > 0
                  ? 'Plano ativado detectado. O saldo elegível pode ser solicitado. Valor mínimo: R$ 10,00.'
                  : 'Para liberar a solicitação, é necessário ativar pelo menos um plano. Valor mínimo: R$ 10,00.'}
              </p>
            </div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-800">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Destino do pagamento</h3>
                  <p className="text-[11px] text-slate-500">Sua chave PIX cadastrada</p>
                </div>
              </div>
              {withdrawalProfile ? (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">Cadastrada</span>
              ) : (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-700">Pendente</span>
              )}
            </div>
            <div className="space-y-3 p-4">
              {withdrawalProfile ? (
                <>
                  <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-700">Chave PIX de recebimento</p>
                    <p className="mt-2 break-all text-sm font-extrabold text-slate-900">{withdrawalProfile.pixKeyType}: {withdrawalProfile.pixKey}</p>
                    <p className="mt-1 text-[11px] text-slate-500">Titular: {withdrawalProfile.holderName}</p>
                  </div>
                  <button
                    onClick={() => {setWithdrawCpf(withdrawalProfile.cpf||'');setWithdrawHolderName(withdrawalProfile.holderName||'');setTempPixType(withdrawalProfile.pixKeyType||'CPF');setTempPixKey(withdrawalProfile.pixKey||'');setSubPage('pix-method');}}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-800 transition hover:text-indigo-700"
                  >
                    <CreditCard className="h-4 w-4" /> Alterar somente a chave PIX
                  </button>
                </>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4">
                  <p className="text-xs leading-relaxed text-amber-900">Cadastre primeiro o CPF, o titular e a chave PIX para configurar o destino do saque.</p>
                  <button
                    onClick={() => {setTempPixType('CPF');setTempPixKey('');setSubPage('pix-method');}}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-indigo-800"
                  >
                    Cadastrar dados para saque <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-900 text-white shadow-md shadow-blue-900/15">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Solicitar retirada</h3>
                  <p className="text-[11px] text-slate-500">Informe quanto deseja solicitar</p>
                </div>
              </div>
            </div>
            <div className="space-y-4 p-4">
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label className="text-xs font-extrabold text-slate-800">Valor do saque</label>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-800">Mínimo R$ 10,00</span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-400">R$</span>
                  <input
                    type="number"
                    min="10"
                    step="0.01"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-2xl font-black tabular-nums text-slate-900 transition placeholder:text-slate-300 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(String((Number(user.withdrawableBalance || 0) + Number(user.depositBalance || 0)).toFixed(2)))}
                  className="mt-2 text-xs font-extrabold text-blue-800 transition hover:text-indigo-700"
                >
                  Usar saldo total disponível
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <div className="flex items-center justify-between py-1 text-xs">
                  <span className="text-slate-500">Valor solicitado</span>
                  <span className="font-bold tabular-nums text-slate-900">{formatBRL(numericWithdraw)}</span>
                </div>
                <div className="flex items-center justify-between py-1 text-xs">
                  <span className="text-slate-500">Taxa de saque</span>
                  <span className="font-bold tabular-nums text-amber-700">{formatBRL(feeValue)} (6%)</span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="text-xs font-extrabold text-slate-800">Valor líquido</span>
                  <span className="text-lg font-black tabular-nums text-blue-900">{formatBRL(receiveValue)}</span>
                </div>
              </div>

              <button
                onClick={handleRequestWithdraw}
                disabled={withdrawalBusy || !withdrawalProfile}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-800 py-4 text-sm font-extrabold text-white shadow-lg shadow-blue-900/20 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {withdrawalBusy ? 'Enviando solicitação...' : 'Solicitar saque'}
                {!withdrawalBusy && <ArrowUpRight className="h-4 w-4" />}
              </button>
              <div className="flex items-start gap-2 rounded-xl bg-blue-50/80 p-3 text-[11px] leading-relaxed text-blue-900">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
                <span>É necessário manter pelo menos um plano ativo. O pedido será enviado para conferência da administração; a transferência PIX é realizada manualmente após a verificação.</span>
              </div>
            </div>
          </section>
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
      const list = isDeposit
        ? [
            ...depositHistory.map((item) => ({ ...item, _kind: 'Depósito' })),
            ...withdrawHistory.map((item) => ({ ...item, _kind: 'Saque' }))
          ].sort((a, b) => Number(b.confirmedAt || b.createdAt || 0) - Number(a.confirmedAt || a.createdAt || 0))
        : withdrawHistory;

      return (
        <div className="space-y-3">
          <button
            onClick={() => setSubPage(null)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-900 py-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 p-5 shadow-xl border border-blue-300/30">
            <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-cyan-300/10 blur-2xl" />
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-cyan-200 shadow-inner">
                <History className="w-7 h-7" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200">Movimentações da conta</div>
                <h2 className="mt-1 text-xl font-black text-white nexus-title">
                  {isDeposit ? 'Histórico de movimentações' : 'Registros de retirada'}
                </h2>
                <p className="mt-1 text-sm leading-snug text-blue-100/90">
                  {isDeposit ? 'Consulte seus depósitos e saques e acompanhe cada atualização.' : 'Acompanhe suas solicitações de saque.'}
                </p>
              </div>
            </div>
            <div className="relative mt-4 h-px bg-gradient-to-r from-cyan-300/60 via-white/20 to-transparent" />
            <p className="relative mt-3 text-[11px] font-semibold tracking-wide text-cyan-100/80">REGISTROS REAIS DA SUA CONTA · STATUS ATUALIZADO</p>
          </div>

          {list.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80">
              <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-700">Nenhuma movimentação encontrada</div>
              <p className="text-xs text-slate-500 mt-1">
                Seus depósitos e saques aparecerão automaticamente aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {list.map((item) => {
                const successful = ['SAQUE BEM SUCEDIDO', 'Pago', 'Aprovado'].includes(item.status);
                const displayStatus = item._kind === 'Depósito' && item.status === 'Pago' ? 'Depósito Aprovado' : item.status;
                return (
                  <div
                    key={item.id}
                    className={`relative overflow-hidden rounded-3xl border-2 bg-white p-4 shadow-lg ${successful ? 'border-emerald-200 shadow-emerald-900/10' : 'border-blue-100 shadow-blue-950/5'}`}
                  >
                    <div className={`absolute inset-x-0 top-0 h-1.5 ${successful ? 'bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-300' : 'bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-300'}`} />
                    <div className="flex items-start justify-between gap-3 pt-1">
                      <div className="min-w-0 flex-1">
                        <div className="text-lg font-black tracking-tight text-slate-950">{item._kind || 'Saque'}</div>
                        <div className="mt-1 break-all text-[11px] font-semibold text-slate-400">Comprovante · #{item.id}</div>
                        <div className="mt-2 text-sm font-medium text-slate-600">{item.date}</div>
                        {item._kind === 'Saque' || !isDeposit ? (
                          <div className="mt-3 space-y-1 rounded-xl bg-slate-50 p-3">
                            <div className="text-sm text-slate-600"><span className="font-bold text-slate-800">Titular:</span> {item.holderName || '—'}</div>
                            <div className="break-all text-sm text-slate-600"><span className="font-bold text-slate-800">PIX:</span> {item.pixKey}</div>
                          </div>
                        ) : null}
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Valor</div>
                        <div className="mt-1 text-2xl font-black tracking-tight text-blue-950">{formatBRL(item.amount)}</div>
                        <span className={`mt-3 inline-flex max-w-[150px] items-center justify-center rounded-full border px-3 py-1.5 text-center text-[11px] font-black uppercase leading-tight tracking-wide ${successful ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                          {displayStatus}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <span className={`h-2 w-2 rounded-full ${successful ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                      Registro de movimentação
                    </div>
                  </div>
                );
              })}
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
              <div className="text-xs text-slate-600">Código, link e níveis</div>
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
                      <p className="mt-1 max-w-[19rem] text-[10px] leading-relaxed text-slate-500">{plan.description}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-xs text-slate-600">{formatBRL(plan.dailyReturn)}/dia · {plan.days} dias</span>
                        <span className="inline-flex items-center rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-1 text-xs font-extrabold text-emerald-800">
                          +{((plan.dailyReturn * plan.days / plan.price) * 100).toFixed(1).replace('.', ',')}%
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
                      <p className="mt-1 max-w-[19rem] text-[10px] leading-relaxed text-slate-500">{plan.description}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <span className="text-xs text-slate-600">{formatBRL(plan.dailyReturn)}/dia · {plan.days} dias</span>
                        <span className="inline-flex items-center rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-1 text-xs font-extrabold text-emerald-800">
                          +{((plan.dailyReturn * plan.days / plan.price) * 100).toFixed(1).replace('.', ',')}%
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

              {investmentRequests.filter((request) => request.status === 'pending').map((request) => (
                <div key={request.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div><div className="text-sm font-extrabold text-amber-950">{request.planName || 'Plano solicitado'}</div><p className="mt-1 text-xs text-amber-800">Pedido enviado · aguardando conferência do administrador</p></div>
                    <span className="rounded-full bg-amber-200 px-3 py-1 text-[10px] font-extrabold text-amber-950">PENDENTE</span>
                  </div>
                  <p className="mt-2 text-xs text-amber-900">Valor: {formatBRL(request.price)}. O saldo ainda não foi debitado e o plano só começa após a aprovação.</p>
                </div>
              ))}

              {activeInvestments.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80">
                  <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <div className="text-sm font-bold text-slate-800">Nenhum plano ativo no momento</div>
                  <p className="text-xs text-slate-500 mt-1">
                    Escolha um plano para solicitar ativação. O ciclo só começa após aprovação administrativa. Valores diários são projeções ilustrativas, não promessa de retorno nem pagamento automático; somente créditos confirmados pela administração entram no saldo sacável.
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
                  const daysInCycle = Math.max(1, Number(inv.days || 1));
                  // O ciclo começa à meia-noite de Brasília; a barra avança proporcionalmente
                  // ao tempo realmente transcorrido desde esse início.
                  const cycleProgress = checkinClock < firstCreditAt ? 0 : Math.min(daysInCycle, (checkinClock - firstCreditAt) / 86400000);
                  const elapsed = checkinClock < firstCreditAt ? 0 : Math.min(daysInCycle, Math.floor(cycleProgress) + (cycleProgress < daysInCycle ? 1 : 0));
                  const daysRemaining = Math.max(0, daysInCycle - Math.floor(cycleProgress));
                  const progressPct = Math.min(100, Math.max(0, Math.round((cycleProgress / daysInCycle) * 100)));
                  const totalExpected = Number(inv.projectedTotal || (inv.dailyReturn * inv.days));
                  return (
                    <div
                      key={inv.instanceId}
                      className="overflow-hidden rounded-[1.75rem] border-2 border-blue-100 bg-white shadow-2xl shadow-blue-950/15"
                    >
                      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 p-6 text-white">
                        <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
                        <div className="absolute -bottom-16 left-1/3 h-36 w-36 rounded-full bg-indigo-400/20 blur-3xl" />
                        <div className="relative flex items-start justify-between gap-3">
                          <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-200">
                              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                              Plano em andamento
                            </div>
                            <h4 className="text-2xl font-black tracking-wide">{inv.name}</h4>
                            <p className="mt-1 text-sm font-medium text-blue-100/90">Acompanhe datas, andamento e pagamentos confirmados deste plano.</p>
                          </div>
                          <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-right backdrop-blur">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-100">Valor do plano</div>
                            <div className="mt-0.5 text-xl font-black text-white">{formatBRL(inv.price)}</div>
                          </div>
                        </div>
                        <div className="relative mt-5 grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-emerald-300/25 bg-emerald-400/10 p-3">
                            <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-100"><TrendingUp className="h-4 w-4" /> Renda diária (prevista)</div>
                            <div className="mt-1 text-2xl font-black text-emerald-300">{formatBRL(inv.dailyReturn)}</div>
                            <div className="mt-0.5 text-[10px] text-emerald-100/70">Estimativa, não pagamento confirmado</div>
                          </div>
                          <div className="rounded-2xl border border-cyan-300/25 bg-cyan-400/10 p-3">
                            <div className="flex items-center gap-1.5 text-xs font-extrabold text-cyan-100"><CheckCircle2 className="h-4 w-4" /> Renda acumulada paga</div>
                            <div className="mt-1 text-2xl font-black text-white">{formatBRL(Number(inv.paidTotal || 0))}</div>
                            <div className="mt-0.5 text-[10px] text-cyan-100/70">Créditos já aprovados</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 p-4 sm:p-5">
                        <div className="rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-cyan-50 to-white p-5 shadow-md shadow-blue-900/5">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-xs font-extrabold uppercase tracking-wider text-blue-900">Progresso do ciclo</div>
                              <div className="mt-1 text-3xl font-black text-blue-950">{progressPct}% <span className="text-base font-bold text-slate-500">do ciclo</span></div>
                            </div>
                            <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3 text-center shadow-md">
                              <div className="text-3xl font-black text-blue-900">{daysRemaining}</div>
                              <div className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">dias restantes</div>
                            </div>
                          </div>
                          <div className="mt-4 h-5 overflow-hidden rounded-full border-2 border-white bg-white shadow-inner">
                            <div className="h-full rounded-full bg-gradient-to-r from-blue-700 via-cyan-500 to-emerald-400 transition-all duration-700" style={{ width: `${progressPct}%` }} />
                          </div>
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm font-extrabold text-slate-700">
                            <span>{elapsed === 0 ? 'Aguardando início' : `Dia ${Math.min(elapsed, daysInCycle)} de ${daysInCycle}`}</span>
                            <span>{Number(inv.daysCredited || 0)} de {inv.days} pagamentos confirmados</span>
                          </div>
                          <p className="mt-3 rounded-xl bg-white/80 p-3 text-sm leading-relaxed text-slate-700">
                            {elapsed === 0
                              ? `Seu acompanhamento começa em ${new Date(firstCreditAt).toLocaleString('pt-BR')}.`
                              : `O ciclo está em andamento. A barra mostra o tempo transcorrido, enquanto os pagamentos são contabilizados somente após confirmação administrativa.`}
                          </p>
                        </div>

                        <div>
                          <div className="mb-3 flex items-center gap-2 text-base font-black text-slate-950">
                            <Clock className="h-5 w-5 text-blue-700" /> Detalhes e datas do plano
                          </div>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-4 shadow-sm">
                              <div className="text-xs font-extrabold uppercase tracking-wider text-blue-800">Aprovado / ativado em</div>
                              <div className="mt-2 text-base font-extrabold text-slate-950">{new Date(Number(inv.startAt || 0)).toLocaleString('pt-BR')}</div>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Primeiro dia do ciclo</div>
                              <div className="mt-1 text-sm font-bold text-slate-900">{new Date(firstCreditAt).toLocaleString('pt-BR')}</div>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Previsão de encerramento</div>
                              <div className="mt-1 text-sm font-bold text-slate-900">{new Date(firstCreditAt + Number(inv.days || 0) * 86400000).toLocaleString('pt-BR')}</div>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Ciclo contratado</div>
                              <div className="mt-1 text-sm font-bold text-slate-900">{inv.days} dias</div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-md shadow-emerald-900/5">
                            <div className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-800">Pagamentos confirmados</div>
                            <div className="mt-2 text-2xl font-black text-emerald-700">{Number(inv.daysCredited || 0)} / {inv.days}</div>
                          </div>
                          <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 shadow-md shadow-amber-900/5">
                            <div className="text-[10px] font-extrabold uppercase tracking-wide text-amber-800">Projeção do ciclo</div>
                            <div className="mt-2 text-2xl font-black text-amber-700">{formatBRL(totalExpected)}</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 text-blue-950 shadow-md">
                          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                          <div>
                            <div className="text-base font-black">Entenda como os pagamentos funcionam</div>
                            <p className="mt-2 text-sm leading-relaxed">
                              Os valores diários e o total do ciclo são projeções informativas, não garantia de rendimento. A administração realiza a conferência e confirma cada pagamento manualmente. Somente valores efetivamente confirmados entram no saldo disponível para saque.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );;
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
      const quickAmounts = [15, 50, 100, 200, 250, 500, 1000, 5000];
      return (
        <div className="space-y-5">
          {/* Card Principal Carteira */}
          <div className="relative overflow-hidden rounded-3xl border border-blue-800/30 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-5 shadow-xl text-white">
            <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full border-[18px] border-cyan-300/10" />
            <div className="pointer-events-none absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-blue-400/10 blur-2xl" />
            <div className="relative">
            <div className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-cyan-100 bg-white/10 border border-white/15 px-3 py-2 rounded-full">
              <Wallet className="w-3.5 h-3.5" />
              <span>CARTEIRA NEXUS AÇÕES</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-3 nexus-title tracking-tight">
              Deposite na sua carteira
            </h2>
            <p className="text-sm text-blue-100/80 mt-1 max-w-xs">Escolha o valor, gere seu pedido PIX e acompanhe a confirmação por aqui.</p>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-cyan-100"><ShieldCheck className="h-4 w-4" /> Conferência manual pela administração</div>
            </div>
          </div>

          {/* Pedido pendente: recuperação disponível somente nesta página de Depósito. */}
          {pendingDepositRequest && (
            <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-md space-y-4">
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
                className="w-full min-h-14 rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-800 px-5 py-4 text-sm font-black text-white shadow-lg flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition"
              >
                <QrCode className="h-4 w-4" />
                {pendingDepositRequest.pixCopyPaste ? 'Ver código PIX e pagar' : 'Consultar pedido / aguardar código PIX'}
              </button>
            </div>
          )}

          {/* Card Valores Rápidos */}
          <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
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
                    className={`min-h-12 py-3 rounded-2xl text-sm font-black border-2 transition active:scale-95 ${
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
          <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-800 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-md">
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
                  min="15"
                  max="5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-4 rounded-2xl border-2 border-blue-100 bg-blue-50/40 text-xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-600"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs pt-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Depósito mínimo</span>
                <span className="font-bold text-slate-900">R$ 15,00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Depósito máximo</span>
                <span className="font-bold text-slate-900">R$ 5.000,00</span>
              </div>
            </div>

            <button
              onClick={handleGeneratePix}
              className="w-full min-h-14 py-4 rounded-2xl bg-gradient-to-r from-blue-950 via-blue-800 to-indigo-700 text-white font-black text-base shadow-xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.99] transition"
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
      const inviteLink = `https://nexus-a-es2.pages.dev/?code=${encodeURIComponent(user.inviteCode)}`;
      const directCount = teamMembers.length;
      const referralTiers = [
        { icon: '🏅', title: 'Nível 1 · Bronze', target: 1, benefit: 'Selo de membro indicador' },
        { icon: '🥈', title: 'Nível 2 · Prata', target: 3, benefit: 'Destaque Prata no perfil' },
        { icon: '🥉', title: 'Nível 3 · Ouro', target: 5, benefit: 'Destaque Ouro no perfil' },
        { icon: '🔥', title: 'Nível 4 · Elite', target: 6, benefit: 'Selo Elite no perfil' }
      ];
      const currentTier = [...referralTiers].reverse().find((tier) => directCount >= tier.target) || null;
      const nextTier = referralTiers.find((tier) => directCount < tier.target) || null;
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
                Aqui você acompanha quem entrou diretamente pelo seu código e seu progresso de participação.
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
                Compartilhe este link. O código será preenchido automaticamente no cadastro.
                <span className="mt-1 block font-semibold text-blue-800 break-all">{inviteLink}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCopy(user.inviteCode, 'Código de convite copiado')}
                className="py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-800 hover:bg-slate-50 active:scale-95 transition"
              >
                <Copy className="inline w-3.5 h-3.5 mr-1" /> Código
              </button>
              <button
                onClick={() => handleCopy(inviteLink, 'Link de convite copiado')}
                className="py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-800 hover:bg-slate-50 active:scale-95 transition"
              >
                <Copy className="inline w-3.5 h-3.5 mr-1" /> Link
              </button>
            </div>
            <button
              disabled={!user.inviteCode}
              onClick={() => setShowInviteShareModal(true)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-950 via-blue-800 to-cyan-700 text-white text-sm font-extrabold shadow-lg shadow-blue-900/20 hover:brightness-110 active:scale-[0.99] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" /> Convidar amigos
            </button>
          </div>

          {showInviteShareModal && (
            <div className="fixed inset-0 z-[70] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3" onClick={() => setShowInviteShareModal(false)}>
              <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl space-y-4" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">Convite personalizado</div>
                    <h3 className="text-lg font-black text-slate-900">Compartilhar com amigos</h3>
                  </div>
                  <button onClick={() => setShowInviteShareModal(false)} className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Fechar">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 text-xs leading-relaxed text-slate-700">
                  Oi! Quero compartilhar com você a NEXUS AÇÕES. Conheça a plataforma, veja como funciona e analise com calma as informações, condições e riscos antes de decidir. Investimentos envolvem riscos e não há garantia de retorno. Se fizer sentido para você, acesse pelo meu convite:
                  <span className="mt-2 block break-all font-bold text-blue-900">{inviteLink}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Oi! Quero compartilhar com você a NEXUS AÇÕES. Conheça a plataforma, veja como funciona e analise com calma as informações, condições e riscos antes de decidir. Investimentos envolvem riscos e não há garantia de retorno. Se fizer sentido para você, acesse pelo meu convite: ${inviteLink}`)}`, '_blank', 'noopener,noreferrer')} className="rounded-xl bg-emerald-600 py-3 text-xs font-extrabold text-white hover:bg-emerald-700">WhatsApp</button>
                  <button onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent('Conheça a NEXUS AÇÕES. Confira as informações, condições e riscos antes de decidir. Investimentos envolvem riscos e não há garantia de retorno.')}`, '_blank', 'noopener,noreferrer')} className="rounded-xl bg-sky-500 py-3 text-xs font-extrabold text-white hover:bg-sky-600">Telegram</button>
                  <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`, '_blank', 'noopener,noreferrer')} className="rounded-xl bg-blue-700 py-3 text-xs font-extrabold text-white hover:bg-blue-800">Facebook</button>
                  <button onClick={() => window.location.href = `sms:?body=${encodeURIComponent(`Conheça a NEXUS AÇÕES e confira as informações, condições e riscos antes de decidir: ${inviteLink}`)}`} className="rounded-xl border border-slate-200 bg-slate-50 py-3 text-xs font-extrabold text-slate-800">SMS / Mensagens</button>
                  <button onClick={() => window.location.href = `mailto:?subject=${encodeURIComponent('Convite para conhecer a NEXUS AÇÕES')}&body=${encodeURIComponent(`Olá! Conheça a NEXUS AÇÕES e confira as informações, condições e riscos antes de decidir. Investimentos envolvem riscos e não há garantia de retorno. Acesse pelo meu convite: ${inviteLink}`)}`} className="rounded-xl border border-slate-200 bg-slate-50 py-3 text-xs font-extrabold text-slate-800">E-mail</button>
                  <button onClick={async () => {
                    const message = `Oi! Quero compartilhar com você a NEXUS AÇÕES. Conheça a plataforma, veja como funciona e analise com calma as informações, condições e riscos antes de decidir. Investimentos envolvem riscos e não há garantia de retorno. Se fizer sentido para você, acesse pelo meu convite: ${inviteLink}`;
                    if (navigator.share) {
                      try { await navigator.share({ title: 'Convite NEXUS AÇÕES', text: message, url: inviteLink }); }
                      catch (error) { if (error?.name !== 'AbortError') showToast('Não foi possível abrir o compartilhamento do aparelho.', 'warning'); }
                    } else {
                      handleCopy(message, 'Convite copiado');
                    }
                  }} className="col-span-2 rounded-xl bg-gradient-to-r from-blue-950 to-indigo-800 py-3.5 text-xs font-extrabold text-white shadow-md hover:brightness-110">Mais aplicativos · Compartilhar pelo celular</button>
                </div>
                <p className="text-[10px] leading-relaxed text-slate-500">O botão “Mais aplicativos” abre as opções de compartilhamento disponíveis no aparelho. A disponibilidade de cada app depende do que está instalado.</p>
              </div>
            </div>
          )}

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

          {/* Progresso dos níveis de participação */}
          <div className="rounded-2xl border border-blue-200/80 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div><div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">SEU PROGRESSO</div><h3 className="mt-1 text-base font-black text-slate-900">Níveis de indicação</h3></div>
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-900">{directCount} convite(s)</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">Os níveis são alcançados pela quantidade de pessoas que se cadastram diretamente usando seu código. A tela mostra sua evolução e os selos conquistados.</p>
            <div className="space-y-2.5">
              {referralTiers.map((tier, index) => {
                const unlocked = directCount >= tier.target;
                const previousTarget = index === 0 ? 0 : referralTiers[index - 1].target;
                const progress = Math.min(100, Math.max(0, ((directCount - previousTarget) / Math.max(1, tier.target - previousTarget)) * 100));
                return <div key={tier.title} className={`rounded-xl border p-3 ${unlocked ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-center gap-3"><span className="text-2xl">{tier.icon}</span><div className="min-w-0 flex-1"><div className="text-xs font-black text-slate-900">{tier.title}</div><div className="text-[11px] text-slate-600">{tier.target === 6 ? '6 ou mais convidados diretos' : `A partir de ${tier.target} convidado(s) direto(s)`}</div><div className="text-[10px] font-semibold text-blue-800 mt-0.5">{tier.benefit}</div></div><span className={`text-[10px] font-extrabold rounded-full px-2 py-1 ${unlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-slate-500'}`}>{unlocked ? 'Conquistado' : 'Bloqueado'}</span></div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-gradient-to-r from-blue-700 to-cyan-400" style={{width:`${unlocked ? 100 : progress}%`}} /></div>
                </div>;
              })}
            </div>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-900"><strong>Nível atual:</strong> {currentTier ? `${currentTier.icon} ${currentTier.title}` : 'Ainda não conquistado'}.{nextTier ? ` Faltam ${Math.max(0, nextTier.target - directCount)} convite(s) direto(s) para ${nextTier.title}.` : ' Você alcançou o nível máximo.'}</div>
            <p className="text-[10px] leading-relaxed text-slate-500">Os níveis são indicadores de participação e não geram créditos automáticos, comissões sobre depósitos ou rendimentos de investimentos.</p>
            <button onClick={() => handleCopy(inviteLink, 'Link de convite copiado')} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition"><Share2 className="w-4 h-4" /><span>Convide seus amigos</span></button>
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
              <div className="mt-2 space-y-2">
                {teamMembers.filter((member) => !teamSearch || String(member.displayName || member.memberUid || '').toLowerCase().includes(teamSearch.toLowerCase())).map((member) => <div key={member.uid} className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="min-w-0"><div className="truncate text-xs font-extrabold text-slate-800">{member.displayName || 'Novo membro'}</div><div className="truncate text-[10px] text-slate-500">UID: {member.uid}</div></div><span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-800">Direto</span></div>)}
                {teamMembers.filter((member) => !teamSearch || String(member.displayName || member.memberUid || '').toLowerCase().includes(teamSearch.toLowerCase())).length === 0 ? <p className="text-xs text-slate-500">{teamSearch ? `Nenhum membro encontrado para "${teamSearch}".` : 'Ninguém entrou pelo seu código ainda. Compartilhe o link acima!'}</p> : null}
              </div>
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
                    <span className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-300/15 border border-cyan-200/20 flex items-center justify-center text-cyan-200 group-hover:from-cyan-300 group-hover:to-blue-400 group-hover:text-slate-950 transition-colors"><Icon className="w-5 h-5" /></span>
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
            aria-label="NEXUS AÇÕES - Tela inicial"
            className="group relative flex items-center gap-2.5 rounded-2xl px-2.5 py-1.5 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 border border-cyan-300/30 shadow-[0_0_18px_rgba(34,211,238,0.18)] hover:shadow-[0_0_24px_rgba(34,211,238,0.32)] transition-all active:scale-[0.98]"
          >
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-300/10 via-transparent to-blue-400/10 opacity-80 pointer-events-none" />
            <span className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-200 via-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_14px_rgba(34,211,238,0.45)] border border-cyan-100/70">
              <TrendingUp className="w-5 h-5 text-slate-950 drop-shadow-sm" />
            </span>
            <span className="relative flex flex-col items-start leading-none">
              <span className="font-black text-[15px] tracking-[0.055em] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-amber-200 drop-shadow-[0_0_7px_rgba(103,232,249,0.45)] nexus-title">
                NEXUS <span className="text-amber-200">AÇÕES</span>
              </span>
              <span className="mt-1 text-[8px] font-extrabold tracking-[0.23em] text-cyan-200/90">MERCADOS &amp; ESTRATÉGIA</span>
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
          <div className="fixed inset-0 z-50 flex justify-start bg-slate-950/65 backdrop-blur-sm">
            <div className="w-full max-w-sm flex">
              <div className="w-[min(86vw,340px)] bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900 h-full shadow-2xl p-5 flex flex-col justify-between animate-slideRight border-r border-cyan-300/20">
                <div>
                  <div className="flex items-center justify-between pb-5 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-amber-300">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <span className="font-black text-base tracking-wide text-white">NEXUS AÇÕES</span>
                    </div>
                    <button
                      onClick={() => setDrawerOpen(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mt-5 space-y-2">
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
                          className="group w-full min-h-[58px] flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-extrabold text-slate-100 bg-white/[0.06] border border-white/10 hover:bg-cyan-300/10 hover:border-cyan-300/40 hover:text-white active:scale-[0.98] transition-all shadow-lg shadow-slate-950/10"
                        >
                          <Icon className="w-4 h-4 text-blue-800" />
                          <span className="flex-1 text-left">{item.label}</span><ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-200" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 text-[11px] text-slate-400">
                  <div>ID: {user.id} • UID: {user.uid}</div>
                  <div className="mt-0.5">NEXUS AÇÕES © 2026</div>
                  <button onClick={onSignOut} className="mt-3 w-full rounded-xl border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-xs font-extrabold text-rose-200 hover:bg-rose-500/20">Sair da conta</button>
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
                    onClick={() => window.open('https://t.me/+-mN9ZrabaLo5MDIx', '_blank', 'noopener,noreferrer')}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-100 via-cyan-50 to-blue-100 text-blue-950 border border-cyan-300 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950/10 hover:brightness-105 transition"
                  >
                    <span>Entrar no grupo oficial do Telegram</span>
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
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3">
            <div className="bg-white w-full max-w-md rounded-[2rem] p-5 shadow-2xl border border-blue-100 space-y-5 max-h-[92vh] overflow-y-auto">
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

              <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 border border-blue-100 rounded-3xl p-5 flex flex-col items-center shadow-inner">
                <div className="text-xs text-slate-500">Valor a pagar</div>
                <div className="text-2xl font-black text-blue-900 my-1">
                  {formatBRL(pixModalData.amount)}
                </div>

                {pixModalData.code ? (
                  <div className="mb-4 w-full rounded-3xl border-2 border-blue-100 bg-white p-4 shadow-lg shadow-blue-900/10">
                    <div className="mx-auto flex min-h-72 w-full max-w-[18rem] items-center justify-center rounded-2xl bg-white p-2">
                      <img
                        src={`https://quickchart.io/qr?text=${encodeURIComponent(pixModalData.code)}&size=320&margin=2`}
                        alt="QR Code do PIX para pagamento"
                        className="mx-auto h-64 w-64 max-w-full object-contain"
                      />
                    </div>
                    <p className="mt-3 text-center text-sm font-extrabold text-blue-950">Escaneie o QR Code com o aplicativo do seu banco</p>
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
                  {pixModalData.status === 'paid' ? <div className="mt-4 flex w-full items-center gap-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 text-left shadow-sm"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md"><Check className="h-7 w-7 stroke-[3]" /></div><div><div className="text-base font-black uppercase tracking-wide text-emerald-700">Depósito Aprovado</div><div className="mt-0.5 text-xs font-semibold text-emerald-700">Pagamento conferido e confirmado pela administração.</div></div></div> : null}
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
        <SupportChat firebaseUser={firebaseUser} displayName={user.id} />
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
