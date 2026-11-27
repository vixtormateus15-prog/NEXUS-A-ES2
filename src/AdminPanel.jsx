import React, { useEffect, useMemo, useState } from 'react';
import { onValue, ref, update } from 'firebase/database';
import { signOut } from 'firebase/auth';
import { auth, database } from './firebase';
import { ShieldCheck, RefreshCw, Search, Clock3, CheckCircle2, XCircle, Copy, ExternalLink, LogOut, Wallet, UserRound, ArrowLeft } from 'lucide-react';

const ADMIN_EMAIL = 'vixtormateus15@gmail.com';
const brl = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dateBR = (value) => value ? new Date(Number(value)).toLocaleString('pt-BR') : '—';

export default function AdminPanel({ firebaseUser }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [pixCode, setPixCode] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const isAdmin = String(firebaseUser?.email || '').toLowerCase() === ADMIN_EMAIL;
  useEffect(() => {
    if (!isAdmin || !database) { setLoading(false); return undefined; }
    return onValue(ref(database, 'withdrawalRequests'), (snapshot) => {
      const value = snapshot.val() || {};
      const list = Object.entries(value).map(([id, item]) => ({ id, ...item }));
      list.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
      setRequests(list);
      setLoading(false);
    }, () => { setMessage('Não foi possível carregar os pedidos. Confira as regras do Realtime Database.'); setLoading(false); });
  }, [isAdmin]);

  const filtered = useMemo(() => requests.filter((item) => {
    const matchesFilter = filter === 'all' || item.status === filter;
    const haystack = [item.uid, item.email, item.name, item.pixKey, item.id].join(' ').toLowerCase();
    return matchesFilter && haystack.includes(search.toLowerCase());
  }), [requests, filter, search]);

  const totals = useMemo(() => ({
    pending: requests.filter(x => x.status === 'pending').length,
    approved: requests.filter(x => x.status === 'approved').length,
    paid: requests.filter(x => x.status === 'paid').length,
    amount: requests.filter(x => x.status !== 'rejected').reduce((sum, x) => sum + Number(x.amount || 0), 0)
  }), [requests]);

  const choose = (item) => {
    setSelected(item);
    setPixCode(item.pixCopyPaste || '');
    setTransactionId(item.transactionId || '');
    setNote(item.adminNote || '');
    setMessage('');
  };

  const save = async (status) => {
    if (!selected || busy) return;
    if (status === 'paid' && !transactionId.trim()) {
      setMessage('Informe o ID/identificador da transferência antes de marcar como pago.');
      return;
    }
    setBusy(true); setMessage('');
    try {
      await update(ref(database, 'withdrawalRequests/' + selected.id), {
        status,
        pixCopyPaste: pixCode.trim(),
        transactionId: transactionId.trim(),
        adminNote: note.trim(),
        updatedAt: Date.now(),
        updatedBy: firebaseUser.uid
      });
      setSelected(null);
      setMessage(status === 'paid' ? 'Pagamento registrado. Confirme a transferência no banco antes de usar este status.' : 'Solicitação atualizada.');
    } catch (error) {
      setMessage('Falha ao salvar: ' + (error?.message || 'verifique as regras do Firebase.'));
    } finally { setBusy(false); }
  };

  if (!isAdmin) return <main className="min-h-screen bg-slate-950 text-white grid place-items-center p-6"><section className="max-w-md text-center rounded-3xl border border-rose-500/30 bg-slate-900 p-8"><ShieldCheck className="mx-auto mb-4 text-rose-400" size={42}/><h1 className="text-2xl font-black">Acesso restrito</h1><p className="mt-2 text-slate-300">Esta conta não está autorizada a acessar o painel administrativo.</p><button onClick={() => window.location.href='/'} className="mt-6 rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950">Voltar ao site</button></section></main>;

  return <main className="min-h-screen bg-[#07111f] text-slate-100">
    <header className="border-b border-white/10 bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4">
        <div className="flex items-center gap-3"><div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-300"><ShieldCheck size={25}/></div><div><p className="text-xs font-bold tracking-[.25em] text-cyan-300">NEXUS AÇÕES</p><h1 className="text-xl font-black sm:text-2xl">Painel administrativo</h1></div></div>
        <div className="flex items-center gap-2"><span className="hidden text-xs text-slate-400 sm:block">{firebaseUser.email}</span><button onClick={() => signOut(auth)} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/5"><LogOut size={16}/> Sair</button></div>
      </div>
    </header>
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-slate-400">Controle de solicitações</p><h2 className="text-2xl font-black">Saques e pagamentos</h2></div><button onClick={() => window.location.href='/'} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm"><ArrowLeft size={16}/> Abrir plataforma</button></div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-4"><p className="text-xs text-slate-400">Pendentes</p><p className="mt-1 text-3xl font-black text-amber-300">{totals.pending}</p></div>
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-4"><p className="text-xs text-slate-400">Aprovados</p><p className="mt-1 text-3xl font-black text-cyan-300">{totals.approved}</p></div>
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-4"><p className="text-xs text-slate-400">Pagos</p><p className="mt-1 text-3xl font-black text-emerald-300">{totals.paid}</p></div>
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-4"><p className="text-xs text-slate-400">Valor em pedidos não recusados</p><p className="mt-1 text-2xl font-black">{brl(totals.amount)}</p></div>
      </div>
      <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
          <div className="space-y-3 border-b border-white/10 p-4">
            <div className="flex items-center justify-between"><h3 className="font-bold">Fila de solicitações</h3><button onClick={() => {setLoading(true);}} className="rounded-lg p-2 text-slate-400 hover:bg-white/5" title="Atualizar"><RefreshCw size={17}/></button></div>
            <div className="relative"><Search className="absolute left-3 top-3 text-slate-500" size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por usuário, e-mail, PIX ou ID" className="w-full rounded-xl border border-white/10 bg-slate-950 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-cyan-400"/></div>
            <div className="flex flex-wrap gap-2">{[['all','Todos'],['pending','Pendentes'],['approved','Aprovados'],['paid','Pagos'],['rejected','Recusados']].map(([value,label])=><button key={value} onClick={()=>setFilter(value)} className={'rounded-full px-3 py-1.5 text-xs font-bold '+(filter===value?'bg-cyan-400 text-slate-950':'bg-slate-800 text-slate-300')}>{label}</button>)}</div>
          </div>
          <div className="max-h-[620px] overflow-y-auto">
            {loading ? <p className="p-6 text-sm text-slate-400">Carregando solicitações...</p> : filtered.length===0 ? <div className="p-8 text-center text-sm text-slate-400"><Wallet className="mx-auto mb-2" size={28}/>Nenhuma solicitação encontrada.</div> : filtered.map(item=><button key={item.id} onClick={()=>choose(item)} className={'block w-full border-b border-white/5 p-4 text-left hover:bg-white/5 '+(selected?.id===item.id?'bg-cyan-400/10':'')}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-bold">{item.name || item.email || item.uid || 'Usuário'}</p><p className="mt-1 truncate text-xs text-slate-400">{item.email || item.uid}</p><p className="mt-2 text-xs text-slate-500">{dateBR(item.createdAt)}</p></div><div className="shrink-0 text-right"><p className="font-black">{brl(item.amount)}</p><span className={'mt-1 inline-block rounded-full px-2 py-1 text-[10px] font-bold '+(item.status==='paid'?'bg-emerald-400/15 text-emerald-300':item.status==='rejected'?'bg-rose-400/15 text-rose-300':item.status==='approved'?'bg-cyan-400/15 text-cyan-300':'bg-amber-400/15 text-amber-300')}>{({pending:'PENDENTE',approved:'APROVADO',paid:'PAGO',rejected:'RECUSADO'})[item.status] || item.status || 'PENDENTE'}</span></div></div></button>)}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-4 sm:p-5">
          {!selected ? <div className="grid min-h-72 place-items-center text-center text-slate-400"><div><UserRound className="mx-auto mb-3" size={34}/><p>Selecione uma solicitação para ver os dados e atualizar o andamento.</p></div></div> : <div className="space-y-4">
            <div><p className="text-xs font-bold tracking-widest text-cyan-300">DETALHES DO PEDIDO</p><h3 className="mt-1 text-xl font-black">{brl(selected.amount)}</h3><p className="text-xs text-slate-400">{selected.id}</p></div>
            <div className="grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-slate-950 p-3"><p className="text-xs text-slate-500">Nome / usuário</p><p className="mt-1 break-all">{selected.name || '—'}</p></div><div className="rounded-xl bg-slate-950 p-3"><p className="text-xs text-slate-500">UID</p><p className="mt-1 break-all">{selected.uid || '—'}</p></div><div className="col-span-2 rounded-xl bg-slate-950 p-3"><p className="text-xs text-slate-500">E-mail</p><p className="mt-1 break-all">{selected.email || '—'}</p></div><div className="col-span-2 rounded-xl bg-slate-950 p-3"><p className="text-xs text-slate-500">Chave PIX ({selected.pixKeyType || 'tipo não informado'})</p><p className="mt-1 break-all">{selected.pixKey || '—'}</p></div><div className="rounded-xl bg-slate-950 p-3"><p className="text-xs text-slate-500">Solicitado em</p><p className="mt-1">{dateBR(selected.createdAt)}</p></div><div className="rounded-xl bg-slate-950 p-3"><p className="text-xs text-slate-500">Status</p><p className="mt-1 font-bold">{selected.status || 'pending'}</p></div></div>
            <label className="block text-xs font-bold text-slate-300">PIX Copia e Cola (opcional)<textarea value={pixCode} onChange={e=>setPixCode(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm outline-none focus:border-cyan-400" placeholder="Cole aqui o código PIX gerado no banco"/></label>
            <label className="block text-xs font-bold text-slate-300">ID / comprovante da transferência<input value={transactionId} onChange={e=>setTransactionId(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm outline-none focus:border-cyan-400" placeholder="Identificador da transação"/></label>
            <label className="block text-xs font-bold text-slate-300">Observação administrativa<textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm outline-none focus:border-cyan-400" placeholder="Anotações internas"/></label>
            <div className="grid grid-cols-2 gap-2"><button disabled={busy} onClick={()=>save('approved')} className="rounded-xl bg-cyan-400 px-3 py-3 text-sm font-black text-slate-950 disabled:opacity-50"><CheckCircle2 className="mr-1 inline" size={16}/> Aprovar</button><button disabled={busy} onClick={()=>save('rejected')} className="rounded-xl bg-rose-500/15 px-3 py-3 text-sm font-bold text-rose-300 disabled:opacity-50"><XCircle className="mr-1 inline" size={16}/> Recusar</button><button disabled={busy} onClick={()=>save('paid')} className="col-span-2 rounded-xl bg-emerald-400 px-3 py-3 font-black text-slate-950 disabled:opacity-50">Confirmar como pago</button></div>
            <p className="text-[11px] leading-relaxed text-amber-200/80">A aprovação não realiza transferência. Marque como pago somente depois de confirmar o PIX no banco e registrar o identificador.</p>
          </div>}
          {message && <p className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-sm text-cyan-100">{message}</p>}
        </div>
      </section>
      <p className="text-center text-xs text-slate-500">Acesso administrativo restrito à conta autorizada. Atualizações sincronizadas pelo Firebase Realtime Database.</p>
    </div>
  </main>;
}
