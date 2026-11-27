import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { auth, firebaseConfigured } from './firebase';
import {
  TrendingUp, Mail, Lock, Eye, EyeOff, ShieldCheck,
  Sparkles, UserPlus, LogIn, ArrowLeft, KeyRound
} from 'lucide-react';

export default function AuthScreen({ configurationMissing = false }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [inviteCode, setInviteCode] = useState(() => new URLSearchParams(window.location.search).get('code') || new URLSearchParams(window.location.search).get('ref') || '');

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setNotice('');
    setPassword('');
    setConfirmPassword('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!firebaseConfigured || !auth) {
      setError('O Firebase ainda não está configurado. Confira as variáveis VITE_FIREBASE no ambiente de publicação.');
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (mode === 'register' && password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (password.length < 6 && mode !== 'reset') {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'register') {
        if (inviteCode.trim()) localStorage.setItem('nexus_pending_invite_code', inviteCode.trim().toUpperCase());
        const credential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        await sendEmailVerification(credential.user);
        await signOut(auth);
        setPassword('');
        setConfirmPassword('');
        setMode('login');
        setNotice('Conta criada! Enviamos um link de confirmação para seu e-mail. Confirme o endereço antes de entrar na plataforma.');
      } else if (mode === 'reset') {
        await sendPasswordResetEmail(auth, normalizedEmail);
        setNotice('Se esse e-mail estiver cadastrado, você receberá um link para redefinir a senha.');
      } else {
        const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        if (!credential.user.emailVerified) {
          await sendEmailVerification(credential.user);
          await signOut(auth);
          setNotice('Seu e-mail ainda não foi confirmado. Enviamos um novo link; confirme-o e depois entre novamente.');
        }
      }
    } catch (err) {
      if (mode === 'register') localStorage.removeItem('nexus_pending_invite_code');
      const messages = {
        'auth/email-already-in-use': 'Este e-mail já possui uma conta. Entre nela ou use a recuperação de senha.',
        'auth/invalid-email': 'Informe um e-mail válido.',
        'auth/invalid-credential': 'E-mail ou senha incorretos.',
        'auth/user-not-found': 'Não encontramos uma conta com esse e-mail.',
        'auth/wrong-password': 'E-mail ou senha incorretos.',
        'auth/weak-password': 'Escolha uma senha com pelo menos 6 caracteres.',
        'auth/too-many-requests': 'Muitas tentativas. Aguarde um pouco e tente novamente.',
        'auth/operation-not-allowed': 'Ative o método E-mail/Senha no Firebase Authentication.',
        'auth/network-request-failed': 'Falha de conexão. Verifique sua internet e tente novamente.',
        'auth/invalid-action-code': 'O link de confirmação expirou ou já foi utilizado. Solicite um novo acesso.'
      };
      setError(messages[err.code] || 'Não foi possível concluir. Verifique os dados e tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  const isRegister = mode === 'register';
  const isReset = mode === 'reset';

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 text-white flex items-center justify-center">
      <div className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.35) 1px, transparent 1px)', backgroundSize: '34px 34px' }} />

      <section className="relative z-10 my-auto w-full max-w-md overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-gradient-to-b from-slate-900/95 via-blue-950/95 to-slate-950/95 shadow-[0_25px_90px_rgba(2,132,199,0.18)] backdrop-blur-xl">
        <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 px-6 pb-6 pt-7">
          <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full border border-cyan-200/10" />
          <div className="absolute -right-2 -top-4 h-24 w-24 rounded-full border border-cyan-200/10" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/40 bg-gradient-to-br from-cyan-300 via-blue-500 to-blue-800 text-white shadow-lg shadow-cyan-500/25">
              <TrendingUp className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-[0.32em] text-cyan-200">PLATAFORMA DIGITAL</p>
              <p className="mt-0.5 bg-gradient-to-r from-white via-cyan-100 to-amber-200 bg-clip-text text-xl font-black tracking-wide text-transparent drop-shadow">NEXUS AÇÕES</p>
              <p className="mt-0.5 text-[10px] font-semibold tracking-[0.18em] text-slate-400">MERCADOS & ESTRATÉGIA</p>
            </div>
          </div>
          <div className="relative mt-6 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-[10px] font-extrabold tracking-wider text-cyan-100">
              <ShieldCheck className="h-3.5 w-3.5" /> ACESSO INDIVIDUAL
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-[10px] font-bold text-amber-200">
              <Sparkles className="h-3 w-3" /> ÁREA DO MEMBRO
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          {configurationMissing ? (
            <>
              <h1 className="text-xl font-black text-white">Configuração necessária</h1>
              <p className="mt-4 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-relaxed text-amber-100">
                O projeto ainda não recebeu a configuração pública do Firebase no ambiente de hospedagem. Configure as variáveis VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID e VITE_FIREBASE_APP_ID para habilitar o acesso.
              </p>
            </>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">
                  {isRegister ? 'Comece sua jornada' : isReset ? 'Recuperação de acesso' : 'Bem-vindo de volta'}
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
                  {isRegister ? 'Criar sua conta' : isReset ? 'Redefinir senha' : 'Acesse sua conta'}
                </h1>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                  {isRegister ? 'Preencha seus dados para criar seu acesso individual.' : isReset ? 'Informe o e-mail cadastrado para receber o link de recuperação.' : 'Entre com seu e-mail e senha para continuar.'}
                </p>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <label className="block text-xs font-bold text-slate-200">
                  E-mail
                  <span className="mt-1.5 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-3.5 transition focus-within:border-cyan-300/60 focus-within:ring-2 focus-within:ring-cyan-400/10">
                    <Mail className="h-4 w-4 shrink-0 text-cyan-300" />
                    <input className="w-full min-w-0 bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-slate-500" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
                  </span>
                </label>

                {!isReset && (
                  <label className="block text-xs font-bold text-slate-200">
                    Senha
                    <span className="mt-1.5 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-3.5 transition focus-within:border-cyan-300/60 focus-within:ring-2 focus-within:ring-cyan-400/10">
                      <Lock className="h-4 w-4 shrink-0 text-cyan-300" />
                      <input className="w-full min-w-0 bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-slate-500" type={showPassword ? 'text' : 'password'} autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo de 6 caracteres" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Mostrar senha" className="shrink-0 text-slate-400 hover:text-cyan-200">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    </span>
                  </label>
                )}

                {isRegister && (
                  <>
                    <label className="block text-xs font-bold text-slate-200">
                      Código de convite <span className="font-medium text-slate-500">(opcional)</span>
                      <input type="text" autoComplete="off" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 24))} placeholder="Digite o código recebido" className="mt-1.5 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-3.5 py-3.5 text-sm uppercase text-white outline-none placeholder:normal-case placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/10" />
                      <span className="mt-1.5 block text-[10px] font-medium text-slate-400">Se abriu um link de convite, o código já aparece preenchido.</span>
                    </label>
                    <label className="block text-xs font-bold text-slate-200">
                      Confirmar senha
                      <span className="mt-1.5 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-3.5 transition focus-within:border-cyan-300/60 focus-within:ring-2 focus-within:ring-cyan-400/10">
                        <KeyRound className="h-4 w-4 shrink-0 text-cyan-300" />
                        <input className="w-full min-w-0 bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-slate-500" type="password" autoComplete="new-password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a senha" />
                      </span>
                    </label>
                    <p className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] p-3 text-[10px] leading-relaxed text-cyan-100/80">
                      Após criar a conta, enviaremos um link para confirmar seu e-mail. A confirmação será necessária para entrar.
                    </p>
                  </>
                )}

                {error && <p role="alert" className="rounded-xl border border-rose-400/25 bg-rose-500/10 p-3 text-xs font-semibold leading-relaxed text-rose-200">{error}</p>}
                {notice && <p role="status" className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-3 text-xs font-semibold leading-relaxed text-emerald-200">{notice}</p>}

                <button disabled={busy} className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-200/30 bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-700 py-4 text-sm font-black text-white shadow-lg shadow-blue-950/50 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60">
                  {busy ? 'Aguarde...' : isRegister ? <><UserPlus className="h-4 w-4" /> Criar conta</> : isReset ? 'Enviar link de recuperação' : <><LogIn className="h-4 w-4" /> Entrar na plataforma</>}
                </button>
              </form>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 border-t border-white/10 pt-5 text-xs font-bold">
                {mode === 'login' && <button type="button" onClick={() => changeMode('reset')} className="text-slate-400 transition hover:text-cyan-200">Esqueci minha senha</button>}
                <button type="button" onClick={() => changeMode(isRegister ? 'login' : 'register')} className="text-cyan-200 transition hover:text-white">
                  {isRegister ? 'Já tenho conta — entrar' : 'Criar cadastro'}
                </button>
                {isReset && <button type="button" onClick={() => changeMode('login')} className="inline-flex items-center gap-1 text-slate-400 hover:text-cyan-200"><ArrowLeft className="h-3.5 w-3.5" /> Voltar ao login</button>}
              </div>
            </>
          )}
        </div>
        <div className="border-t border-white/10 bg-black/20 px-5 py-4 text-center">
          <p className="text-[10px] leading-relaxed text-slate-500">NEXUS AÇÕES · Acesso individual pelo Firebase Authentication.</p>
          <p className="mt-1 text-[9px] text-slate-600">Nunca compartilhe sua senha ou códigos de confirmação.</p>
        </div>
      </section>
    </main>
  );
}
