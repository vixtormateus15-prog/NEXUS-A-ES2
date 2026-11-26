import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, firebaseConfigured } from './firebase';
import { TrendingUp, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function AuthScreen({ configurationMissing = false }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!firebaseConfigured || !auth) {
      setError('O Firebase ainda não está configurado. Confira as variáveis VITE_FIREBASE no ambiente de publicação.');
      return;
    }
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
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else if (mode === 'reset') {
        await sendPasswordResetEmail(auth, email.trim());
        setNotice('Enviamos um link de redefinição para seu e-mail, se ele estiver cadastrado.');
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err) {
      const messages = {
        'auth/email-already-in-use': 'Este e-mail já possui cadastro.',
        'auth/invalid-email': 'Informe um e-mail válido.',
        'auth/invalid-credential': 'E-mail ou senha incorretos.',
        'auth/weak-password': 'Escolha uma senha com pelo menos 6 caracteres.',
        'auth/too-many-requests': 'Muitas tentativas. Aguarde e tente novamente.',
        'auth/operation-not-allowed': 'Ative o método E-mail/Senha no Firebase Authentication.'
      };
      setError(messages[err.code] || 'Não foi possível concluir. Verifique a conexão e tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <section className="w-full max-w-md rounded-3xl border border-slate-700 bg-white p-6 shadow-2xl">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-900 to-cyan-600 text-white">
          <TrendingUp className="h-7 w-7" />
        </div>
        <p className="text-center text-xs font-black tracking-[0.25em] text-blue-800">NEXUS AÇÕES</p>
        <h1 className="mt-2 text-center text-2xl font-black text-slate-900">
          {configurationMissing ? 'Configuração necessária' : mode === 'register' ? 'Criar sua conta' : mode === 'reset' ? 'Recuperar senha' : 'Acesse sua conta'}
        </h1>
        {configurationMissing ? (
          <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
            O projeto ainda não recebeu a configuração pública do Firebase no ambiente de hospedagem. Configure as variáveis VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID e VITE_FIREBASE_APP_ID para habilitar o acesso.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              E-mail
              <span className="mt-1 flex items-center gap-2 rounded-xl border border-slate-300 px-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <input className="w-full py-3 text-sm outline-none" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
              </span>
            </label>
            {mode !== 'reset' && (
              <label className="block text-sm font-semibold text-slate-700">
                Senha
                <span className="mt-1 flex items-center gap-2 rounded-xl border border-slate-300 px-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <input className="w-full py-3 text-sm outline-none" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo de 6 caracteres" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Mostrar senha" className="text-slate-400">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                </span>
              </label>
            )}
            {mode === 'register' && (
              <label className="block text-sm font-semibold text-slate-700">
                Confirmar senha
                <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none" type="password" autoComplete="new-password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a senha" />
              </label>
            )}
            {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
            {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
            <button disabled={busy} className="w-full rounded-xl bg-gradient-to-r from-blue-950 to-blue-700 py-3.5 text-sm font-extrabold text-white disabled:opacity-60">
              {busy ? 'Aguarde...' : mode === 'register' ? 'Criar conta' : mode === 'reset' ? 'Enviar link de recuperação' : 'Entrar'}
            </button>
          </form>
        )}
        {!configurationMissing && (
          <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-bold text-blue-800">
            {mode === 'login' && <button type="button" onClick={() => { setMode('reset'); setError(''); setNotice(''); }}>Esqueci minha senha</button>}
            <button type="button" onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); setNotice(''); }}>
              {mode === 'register' ? 'Já tenho conta — entrar' : 'Criar cadastro'}
            </button>
            {mode === 'reset' && <button type="button" onClick={() => { setMode('login'); setError(''); setNotice(''); }}>Voltar ao login</button>}
          </div>
        )}
        <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-500">Acesso individual protegido pelo Firebase Authentication. Cadastro não representa depósito ou investimento.</p>
      </section>
    </main>
  );
}
