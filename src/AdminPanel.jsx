import React, { useEffect, useMemo, useState } from 'react';
import { onValue, ref, runTransaction, update } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { auth, database } from './firebase';
import {
  LayoutDashboard, Users, Wallet, ArrowDownToLine, ArrowUpFromLine, Gift,
  BarChart3, Settings, Search, RefreshCw, LogOut, ExternalLink, ShieldCheck,
  Copy, CheckCircle2, XCircle, Clock3, Menu, X, CircleDollarSign, Activity,
  UserRound, ClipboardList, QrCode, AlertCircle
} from 'lucide-react';

const ADMIN_EMAIL = 'vixtormateus15@gmail.com';
const money = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const date = (v) => v ? new Date(Number(v)).toLocaleString('pt-BR') : '—';
const statusLabel = (s) => ({ pending:'Pendente', awaiting_payment:'Aguardando pagamento', paid:'Pago', approved:'Aprovado', rejected:'Recusado', cancelled:'Cancelado' }[s] || s || 'Pendente');
const statusClass = (s) => s === 'paid' || s === 'approved' ? 'text-emerald-300 bg-emerald-400/10' : s === 'rejected' || s === 'cancelled' ? 'text-rose-300 bg-rose-400/10' : 'text-amber-200 bg-amber-400/10';

const NAV = [
  ['overview','Visão geral',LayoutDashboard],
  ['deposits','Depósitos',ArrowDownToLine],
  ['withdrawals','Saques',ArrowUpFromLine],
  ['users','Clientes',Users],
  ['wallets','Carteiras',Wallet],
  ['bonuses','Bônus e check-ins',Gift],
  ['reports','Relatórios',BarChart3],
  ['settings','Configurações',Settings]
];

export default function AdminPanel({ firebaseUser }) {
  const [section,setSection] = useState('overview');
  const [mobileNav,setMobileNav] = useState(false);
  const [deposits,setDeposits] = useState([]);
  const [withdrawals,setWithdrawals] = useState([]);
  const [profiles,setProfiles] = useState([]);
  const [wallets,setWallets] = useState([]);
  const [loading,setLoading] = useState(true);
  const [search,setSearch] = useState('');
  const [filter,setFilter] = useState('all');
  const [selected,setSelected] = useState(null);
  const [pixCode,setPixCode] = useState('');
  const [txId,setTxId] = useState('');
  const [note,setNote] = useState('');
  const [busy,setBusy] = useState(false);
  const [notice,setNotice] = useState('');
  const isAdmin = String(firebaseUser?.email || '').toLowerCase() === ADMIN_EMAIL;

  useEffect(() => {
    if (!isAdmin || !database) { setLoading(false); return; }
    const stops = [];
    const subscribe = (path, setter) => stops.push(onValue(ref(database,path),(snap) => {
      const raw=snap.val() || {};
      setter(Object.entries(raw).map(([id,value]) => ({id,...(value || {})})).sort((a,b)=>Number(b.createdAt || 0)-Number(a.createdAt || 0)));
      setLoading(false);
    },() => { setNotice('Falha ao ler '+path+'. Verifique as regras do Realtime Database.'); setLoading(false); }));
    subscribe('depositRequests',setDeposits);
    subscribe('withdrawalRequests',setWithdrawals);
    subscribe('profiles',setProfiles);
    subscribe('wallets',setWallets);
    return () => stops.forEach(stop => stop());
  },[isAdmin]);

  const all = section === 'deposits' ? deposits : withdrawals;
  const filtered = useMemo(() => all.filter((item) => {
    const statusOk=filter==='all' || item.status===filter;
    const hay=[item.id,item.uid,item.email,item.name,item.pixKey,item.amount].join(' ').toLowerCase();
    return statusOk && hay.includes(search.toLowerCase());
  }),[all,filter,search]);
  const pendingDeposits=deposits.filter(x=>x.status==='pending' || x.status==='awaiting_payment');
  const pendingWithdrawals=withdrawals.filter(x=>x.status==='pending' || x.status==='approved');
  const depositTotal=deposits.filter(x=>x.status==='paid').reduce((n,x)=>n+Number(x.amount||0),0);
  const paidWithdrawals=withdrawals.filter(x=>x.status==='paid').reduce((n,x)=>n+Number(x.amount||0),0);
  const selectedTitle=selected ? (selected.name || selected.email || selected.uid || selected.id) : '';

  const openRequest=(item,type) => {
    setSelected({...item,_type:type});
    setPixCode(item.pixCopyPaste || item.pixCode || '');
    setTxId(item.transactionId || '');
    setNote(item.adminNote || '');
    setNotice('');
  };
  const saveRequest=async(status) => {
    if(!selected || busy) return;
    if(selected._type==='deposit' && status==='paid' && !txId.trim()) { setNotice('Informe o identificador ou comprovante bancário antes de confirmar o depósito.'); return; }
    if(selected._type==='withdrawal' && status==='paid' && !txId.trim()) { setNotice('Informe o identificador da transferência antes de marcar o saque como pago.'); return; }
    if(selected._type==='deposit' && status==='awaiting_payment' && !pixCode.trim()) { setNotice('Cole o código PIX Copia e Cola gerado no seu banco.'); return; }
    setBusy(true); setNotice('');
    try {
      const path=(selected._type==='deposit'?'depositRequests/':'withdrawalRequests/')+selected.id;
      if (selected._type === 'deposit' && status === 'paid') {
        const walletRef = ref(database, 'wallets/' + selected.uid);
        const amount = Number(Number(selected.amount || 0).toFixed(2));
        if (!selected.uid || !Number.isFinite(amount) || amount <= 0) throw new Error('Pedido sem usuário ou valor válido.');
        await runTransaction(walletRef, (current) => {
          const wallet = current || {};
          const credits = wallet.depositCredits || {};
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
        await update(ref(database, 'depositHistory/' + selected.uid + '/' + selected.id), {
          amount,
          status: 'paid',
          confirmedAt: Date.now(),
          transactionId: txId.trim(),
          requestId: selected.id
        });
      }
      const changes = {
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
        await update(ref(database,path), changes);
      }
      setSelected(null);
      setNotice(status === 'paid' && selected._type === 'deposit' ? 'Depósito confirmado e crédito registrado na carteira do cliente.' : 'Registro atualizado no Firebase. Confira o extrato bancário antes de confirmar pagamentos.');
    } catch(e) { setNotice('Não foi possível salvar: '+(e?.message || 'verifique as permissões do Firebase.')); }
    finally { setBusy(false); }
  };

  if(!isAdmin) return <main className="min-h-screen grid place-items-center bg-slate-950 p-6 text-white"><section className="max-w-md rounded-3xl border border-rose-400/20 bg-slate-900 p-8 text-center"><ShieldCheck className="mx-auto mb-4 text-rose-300" size={42}/><h1 className="text-2xl font-black">Acesso restrito</h1><p className="mt-2 text-slate-300">Esta conta não está autorizada a acessar a administração.</p><button onClick={()=>window.location.href='/'} className="mt-6 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">Voltar à plataforma</button></section></main>;

  const nav=<div className="flex h-full flex-col">
    <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5"><div className="rounded-xl bg-cyan-400/15 p-2.5 text-cyan-300"><ShieldCheck size={24}/></div><div><p className="text-[10px] font-black tracking-[.25em] text-cyan-300">NEXUS AÇÕES</p><p className="text-lg font-black">Central Admin</p></div></div>
    <nav className="flex-1 space-y-1 p-3">{NAV.map(([id,label,Icon])=><button key={id} onClick={()=>{setSection(id);setSelected(null);setMobileNav(false);setSearch('');setFilter('all');}} className={'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition '+(section===id?'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/30':'text-slate-400 hover:bg-white/5 hover:text-white')}><Icon size={18}/>{label}{id==='deposits' && pendingDeposits.length>0 ? <span className="ml-auto rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-black text-slate-950">{pendingDeposits.length}</span> : null}{id==='withdrawals' && pendingWithdrawals.length>0 ? <span className="ml-auto rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-black text-slate-950">{pendingWithdrawals.length}</span> : null}</button>)}</nav>
    <div className="border-t border-white/10 p-4"><p className="truncate text-xs text-slate-400">{firebaseUser.email}</p><button onClick={()=>signOut(auth)} className="mt-3 flex w-full items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"><LogOut size={16}/> Sair da conta</button></div>
  </div>;

  const metric=(label,value,Icon,color='text-cyan-300',hint='')=><div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-400">{label}</span><Icon className={color} size={20}/></div><p className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">{value}</p>{hint?<p className="mt-1 text-[11px] text-slate-500">{hint}</p>:null}</div>;

  const requestWorkspace=(type) => <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,.9fr)]">
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80">
      <div className="space-y-3 border-b border-white/10 p-4"><div className="flex items-center justify-between gap-3"><div><h3 className="font-bold">{type==='deposit'?'Fila de depósitos':'Fila de saques'}</h3><p className="text-xs text-slate-500">Pedidos sincronizados pelo Firebase</p></div><button onClick={()=>setNotice('A lista é atualizada automaticamente em tempo real.')} className="rounded-lg border border-white/10 p-2 text-slate-400"><RefreshCw size={16}/></button></div>
      <div className="relative"><Search className="absolute left-3 top-3 text-slate-500" size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar cliente, e-mail, PIX ou código..." className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-cyan-400"/></div>
      <div className="flex flex-wrap gap-2">{[['all','Todos'],['pending','Pendentes'],...(type==='deposit'?[['awaiting_payment','PIX enviado']]:[['approved','Aprovados']]),['paid','Pagos'],['rejected','Recusados']].map(([v,l])=><button key={v} onClick={()=>setFilter(v)} className={'rounded-full px-3 py-1.5 text-xs font-bold '+(filter===v?'bg-cyan-400 text-slate-950':'bg-slate-800 text-slate-300')}>{l}</button>)}</div></div>
      <div className="max-h-[650px] overflow-y-auto">{loading?<p className="p-6 text-sm text-slate-400">Carregando registros...</p>:filtered.length===0?<div className="p-10 text-center text-sm text-slate-500"><ClipboardList className="mx-auto mb-3" size={30}/>Nenhum pedido nesta lista.</div>:filtered.map(item=><button key={item.id} onClick={()=>openRequest(item,type)} className={'block w-full border-b border-white/5 p-4 text-left hover:bg-white/5 '+(selected?.id===item.id?'bg-cyan-400/10':'')}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-bold">{item.name||item.email||item.uid||'Cliente'}</p><p className="mt-1 truncate text-xs text-slate-500">{item.email||item.uid||item.id}</p><p className="mt-2 text-[11px] text-slate-500">{date(item.createdAt)}</p></div><div className="shrink-0 text-right"><p className="font-black">{money(item.amount)}</p><span className={'mt-1 inline-block rounded-full px-2 py-1 text-[10px] font-bold '+statusClass(item.status)}>{statusLabel(item.status)}</span></div></div></button>)}</div>
    </section>
    <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-5">{!selected||selected._type!==type?<div className="grid min-h-80 place-items-center text-center text-slate-500"><div><UserRound className="mx-auto mb-3" size={36}/><p>Selecione um pedido para consultar os detalhes e administrar.</p></div></div>:<div className="space-y-4">
      <div><p className="text-[10px] font-black tracking-[.2em] text-cyan-300">DETALHES DO PEDIDO</p><h3 className="mt-1 text-2xl font-black">{money(selected.amount)}</h3><p className="break-all text-xs text-slate-500">{selected.id}</p></div>
      <div className="grid grid-cols-2 gap-2 text-sm"><div className="rounded-xl bg-slate-950 p-3"><p className="text-[10px] text-slate-500">Cliente</p><p className="mt-1 break-all">{selected.name||'—'}</p></div><div className="rounded-xl bg-slate-950 p-3"><p className="text-[10px] text-slate-500">Status</p><p className="mt-1">{statusLabel(selected.status)}</p></div><div className="col-span-2 rounded-xl bg-slate-950 p-3"><p className="text-[10px] text-slate-500">E-mail / UID</p><p className="mt-1 break-all">{selected.email||'—'} / {selected.uid||'—'}</p></div>
      {type==='withdrawal'?<div className="col-span-2 rounded-xl bg-slate-950 p-3"><p className="text-[10px] text-slate-500">Chave PIX ({selected.pixKeyType||'tipo não informado'})</p><p className="mt-1 break-all font-semibold">{selected.pixKey||'Não informada'}</p></div>:null}
      <div className="col-span-2 rounded-xl bg-slate-950 p-3"><p className="text-[10px] text-slate-500">Criado em</p><p className="mt-1">{date(selected.createdAt)}</p></div></div>
      {type==='deposit'?<label className="block text-xs font-bold text-slate-300">PIX Copia e Cola gerado no seu banco<textarea value={pixCode} onChange={e=>setPixCode(e.target.value)} rows={4} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm outline-none focus:border-cyan-400" placeholder="Cole aqui o código PIX real do banco"/></label>:null}
      <label className="block text-xs font-bold text-slate-300">Identificador / comprovante bancário<input value={txId} onChange={e=>setTxId(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm outline-none focus:border-cyan-400" placeholder="ID da transação ou referência"/></label>
      <label className="block text-xs font-bold text-slate-300">Observação administrativa<textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm outline-none focus:border-cyan-400" placeholder="Anotação interna"/></label>
      {type==='deposit'?<div className="grid grid-cols-2 gap-2"><button disabled={busy} onClick={()=>saveRequest('awaiting_payment')} className="rounded-xl bg-cyan-400 px-3 py-3 text-sm font-black text-slate-950 disabled:opacity-50"><QrCode className="mr-1 inline" size={16}/> Enviar PIX ao cliente</button><button disabled={busy} onClick={()=>saveRequest('rejected')} className="rounded-xl bg-rose-500/15 px-3 py-3 text-sm font-bold text-rose-300">Recusar</button><button disabled={busy} onClick={()=>saveRequest('paid')} className="col-span-2 rounded-xl bg-emerald-400 px-3 py-3 font-black text-slate-950 disabled:opacity-50"><CheckCircle2 className="mr-1 inline" size={17}/> Confirmar depósito recebido</button></div>:<div className="grid grid-cols-2 gap-2"><button disabled={busy} onClick={()=>saveRequest('approved')} className="rounded-xl bg-cyan-400 px-3 py-3 text-sm font-black text-slate-950">Aprovar solicitação</button><button disabled={busy} onClick={()=>saveRequest('rejected')} className="rounded-xl bg-rose-500/15 px-3 py-3 text-sm font-bold text-rose-300">Recusar</button><button disabled={busy} onClick={()=>saveRequest('paid')} className="col-span-2 rounded-xl bg-emerald-400 px-3 py-3 font-black text-slate-950 disabled:opacity-50">Confirmar saque pago</button></div>}
      <p className="text-[11px] leading-relaxed text-amber-200/80">{type==='deposit'?'O código PIX só deve ser enviado depois de gerado no banco. Confirme como recebido apenas após verificar o crédito no extrato.':'A aprovação não transfere dinheiro. Faça a transferência no banco e só então marque como pago.'}</p>
    </div>}</section>
  </div>;

  return <main className="min-h-screen bg-[#07111f] text-slate-100">
    <div className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 bg-[#091525] lg:block">{nav}</div>
    {mobileNav?<div className="fixed inset-0 z-50 bg-black/70 lg:hidden" onClick={()=>setMobileNav(false)}><aside className="h-full w-72 bg-[#091525]" onClick={e=>e.stopPropagation()}>{nav}</aside></div>:null}
    <div className="lg:pl-64">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#07111f]/90 px-4 py-3 backdrop-blur-xl sm:px-6"><div className="flex items-center gap-3"><button onClick={()=>setMobileNav(true)} className="rounded-lg border border-white/10 p-2 lg:hidden"><Menu size={19}/></button><div><p className="text-[10px] font-bold tracking-[.2em] text-cyan-300">NEXUS AÇÕES / ADMIN</p><h1 className="text-lg font-black sm:text-xl">{NAV.find(x=>x[0]===section)?.[1]}</h1></div></div><div className="flex items-center gap-2"><span className="hidden max-w-48 truncate text-xs text-slate-400 sm:block">{firebaseUser.email}</span><button onClick={()=>window.location.href='/'} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/5"><ExternalLink size={15}/> Plataforma</button></div></header>
      <div className="mx-auto max-w-[1500px] space-y-6 p-4 sm:p-6">
        {notice?<div className="flex items-start gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-100"><AlertCircle className="mt-0.5 shrink-0" size={17}/>{notice}<button className="ml-auto" onClick={()=>setNotice('')}><X size={16}/></button></div>:null}
        {section==='overview'?<><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-slate-400">Resumo operacional</p><h2 className="text-2xl font-black sm:text-3xl">Visão geral</h2><p className="mt-1 text-xs text-slate-500">Indicadores calculados a partir dos registros disponíveis no Firebase.</p></div><span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300"><Activity size={14}/> Sincronização em tempo real</span></div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metric('Clientes cadastrados',profiles.length,Users)}{metric('Depósitos aguardando',pendingDeposits.length,ArrowDownToLine,'text-amber-300')}{metric('Saques aguardando',pendingWithdrawals.length,ArrowUpFromLine,'text-amber-300')}{metric('Carteiras encontradas',wallets.length,Wallet,'text-violet-300')}</div>
          <div className="grid gap-3 xl:grid-cols-2">{metric('Total de depósitos confirmados',money(depositTotal),CircleDollarSign,'text-emerald-300','Somente registros com status Pago')}{metric('Total de saques marcados como pagos',money(paidWithdrawals),CircleDollarSign,'text-cyan-300','Registro administrativo; não consulta seu banco')}</div>
          <section className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-lg font-black">Depósitos para atender</h3><p className="text-xs text-slate-400">Os novos pedidos aparecem aqui automaticamente. Selecione um pedido para colar o PIX e enviar ao cliente.</p></div><span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-slate-950">{pendingDeposits.length} aguardando</span></div>{pendingDeposits.length>0?requestWorkspace('deposit'):<div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 text-center"><CheckCircle2 className="mx-auto mb-2 text-emerald-300" size={28}/><p className="font-semibold">Nenhum depósito aguardando atendimento</p><p className="mt-1 text-xs text-slate-500">Quando um cliente solicitar um depósito, o pedido aparecerá automaticamente nesta tela.</p></div>}</section>
          <div className="grid gap-4 xl:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5"><h3 className="font-bold">Ações rápidas</h3><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={()=>setSection('deposits')} className="rounded-xl bg-cyan-400/10 p-4 text-left text-sm font-bold text-cyan-200 hover:bg-cyan-400/20"><ArrowDownToLine className="mb-2" size={20}/> Ver depósitos</button><button onClick={()=>setSection('withdrawals')} className="rounded-xl bg-amber-400/10 p-4 text-left text-sm font-bold text-amber-200 hover:bg-amber-400/20"><ArrowUpFromLine className="mb-2" size={20}/> Ver saques</button><button onClick={()=>setSection('users')} className="rounded-xl bg-violet-400/10 p-4 text-left text-sm font-bold text-violet-200 hover:bg-violet-400/20"><Users className="mb-2" size={20}/> Consultar clientes</button><button onClick={()=>setSection('reports')} className="rounded-xl bg-emerald-400/10 p-4 text-left text-sm font-bold text-emerald-200 hover:bg-emerald-400/20"><BarChart3 className="mb-2" size={20}/> Relatórios</button></div></div><div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5"><div className="flex items-center gap-2 text-amber-200"><AlertCircle size={19}/><h3 className="font-bold">Atenção: processamento manual</h3></div><p className="mt-2 text-sm leading-relaxed text-slate-300">Este painel registra suas ações. Ele não consulta o extrato bancário nem realiza transferências. Envie o código PIX verdadeiro e confirme depósitos ou saques somente após a verificação no banco.</p></div></div>
        </>:null}
        {section==='deposits'?<><div><h2 className="text-2xl font-black">Gestão de depósitos</h2><p className="mt-1 text-sm text-slate-400">Cole o PIX gerado no seu banco e disponibilize o código ao cliente.</p></div><div className="grid gap-3 sm:grid-cols-3">{metric('Pedidos',deposits.length,ClipboardList)}{metric('Aguardando PIX',pendingDeposits.length,Clock3,'text-amber-300')}{metric('Confirmado no painel',money(depositTotal),CircleDollarSign,'text-emerald-300')}</div>{requestWorkspace('deposit')}</>:null}
        {section==='withdrawals'?<><div><h2 className="text-2xl font-black">Gestão de saques</h2><p className="mt-1 text-sm text-slate-400">Consulte a chave PIX, faça a transferência e registre a confirmação.</p></div><div className="grid gap-3 sm:grid-cols-3">{metric('Solicitações',withdrawals.length,ClipboardList)}{metric('Aguardando análise',pendingWithdrawals.length,Clock3,'text-amber-300')}{metric('Marcado como pago',money(paidWithdrawals),CircleDollarSign,'text-emerald-300')}</div>{requestWorkspace('withdrawal')}</>:null}
        {section==='users'?<><div><h2 className="text-2xl font-black">Clientes cadastrados</h2><p className="mt-1 text-sm text-slate-400">Consulta dos perfis que as regras do Firebase permitem ao administrador visualizar.</p></div><div className="relative max-w-xl"><Search className="absolute left-3 top-3 text-slate-500" size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nome, e-mail ou UID" className="w-full rounded-xl border border-white/10 bg-slate-900 py-3 pl-10 pr-3 text-sm outline-none focus:border-cyan-400"/></div><div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80">{profiles.filter(x=>[x.id,x.email,x.displayName,x.name].join(' ').toLowerCase().includes(search.toLowerCase())).map(x=><div key={x.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 p-4"><div className="min-w-0"><p className="font-bold">{x.displayName||x.name||'Cliente'}</p><p className="break-all text-xs text-slate-500">{x.email||x.id}</p><p className="break-all text-[10px] text-slate-600">UID: {x.id}</p></div><button onClick={()=>{navigator.clipboard?.writeText(x.id);setNotice('UID copiado.')}} className="rounded-lg border border-white/10 p-2 text-slate-300"><Copy size={16}/></button></div>)}{profiles.length===0?<p className="p-8 text-center text-sm text-slate-500">Nenhum perfil retornado. Verifique as permissões de leitura administrativa no Firebase.</p>:null}</div></>:null}
        {section==='wallets'?<><div><h2 className="text-2xl font-black">Carteiras</h2><p className="mt-1 text-sm text-slate-400">Consulta dos saldos registrados; não altere valores diretamente nesta tela.</p></div><div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80">{wallets.map(w=><div key={w.id} className="grid gap-2 border-b border-white/5 p-4 sm:grid-cols-4"><div className="break-all text-xs text-slate-400 sm:col-span-2">UID: {w.id}</div><div><p className="text-[10px] text-slate-500">Saldo disponível</p><p className="font-black">{money(w.withdrawableBalance)}</p></div><div><p className="text-[10px] text-slate-500">Check-ins</p><p className="font-bold">{Number(w.checkinCount||0)}</p></div></div>)}{wallets.length===0?<p className="p-8 text-center text-sm text-slate-500">Nenhuma carteira retornada.</p>:null}</div></>:null}
        {section==='bonuses'?<><div><h2 className="text-2xl font-black">Bônus e check-ins</h2><p className="mt-1 text-sm text-slate-400">Visão de acompanhamento dos dados de carteira.</p></div><div className="grid gap-3 sm:grid-cols-3">{metric('Carteiras com check-in',wallets.filter(x=>Number(x.checkinCount||0)>0).length,Gift,'text-violet-300')}{metric('Check-ins registrados',wallets.reduce((n,x)=>n+Number(x.checkinCount||0),0),CheckCircle2)}{metric('Saldo de carteira somado',money(wallets.reduce((n,x)=>n+Number(x.withdrawableBalance||0),0)),Wallet,'text-emerald-300')}</div><p className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100">Crédito e alteração de bônus precisam ser executados por uma rotina de servidor com validação e histórico imutável. Este painel não inventa nem credita valores.</p></>:null}
        {section==='reports'?<><div><h2 className="text-2xl font-black">Relatórios</h2><p className="mt-1 text-sm text-slate-400">Resumo financeiro dos registros existentes.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metric('Depósitos registrados',deposits.length,ArrowDownToLine)}{metric('Depósitos confirmados',money(depositTotal),CircleDollarSign,'text-emerald-300')}{metric('Saques registrados',withdrawals.length,ArrowUpFromLine)}{metric('Saques pagos',money(paidWithdrawals),CircleDollarSign,'text-cyan-300')}</div><div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5"><h3 className="font-bold">Últimas movimentações</h3>{[...deposits.map(x=>({...x,_kind:'Depósito'})),...withdrawals.map(x=>({...x,_kind:'Saque'}))].sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0)).slice(0,20).map(x=><div key={x._kind+x.id} className="flex items-center justify-between gap-3 border-b border-white/5 py-3 text-sm"><div><p className="font-semibold">{x._kind} · {x.email||x.uid||'Cliente'}</p><p className="text-xs text-slate-500">{date(x.createdAt)}</p></div><div className="text-right"><p className="font-bold">{money(x.amount)}</p><p className="text-[10px] text-slate-400">{statusLabel(x.status)}</p></div></div>)}</div></>:null}
        {section==='settings'?<><div><h2 className="text-2xl font-black">Configurações</h2><p className="mt-1 text-sm text-slate-400">Informações e estado de acesso do painel.</p></div><div className="max-w-2xl space-y-3 rounded-2xl border border-white/10 bg-slate-900/80 p-5"><div className="flex items-center gap-3"><ShieldCheck className="text-emerald-300" size={24}/><div><p className="font-bold">Conta administrativa reconhecida</p><p className="text-xs text-slate-400">{firebaseUser.email}</p></div></div><div className="border-t border-white/10 pt-3 text-sm text-slate-400">Projeto Firebase conectado: Realtime Database. As permissões efetivas dependem das regras publicadas no console do Firebase.</div><button onClick={()=>window.location.href='https://console.firebase.google.com/project/nexus-acoes/database/nexus-acoes-default-rtdb/data'} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/5">Abrir Firebase Console <ExternalLink className="ml-1 inline" size={14}/></button></div></>:null}
        <footer className="border-t border-white/10 pt-4 text-center text-[11px] text-slate-600">NEXUS AÇÕES · Painel administrativo · Ações financeiras registradas exigem conferência bancária.</footer>
      </div>
    </div>
  </main>;
}
