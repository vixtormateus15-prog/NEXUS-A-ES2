import React, { useEffect, useRef, useState } from 'react';
import { get, onValue, push, ref, set } from 'firebase/database';
import { Bell, BellRing, Headset, Send, X } from 'lucide-react';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';
import { app, database, firebaseConfigPublic } from './firebase';

export default function SupportChat({ firebaseUser, displayName }) {
  const [open,setOpen]=useState(false),[messages,setMessages]=useState([]),[draft,setDraft]=useState(''),[busy,setBusy]=useState(false),[position,setPosition]=useState(null),[pushStatus,setPushStatus]=useState('idle'),[pushMessage,setPushMessage]=useState('');
  const drag=useRef(null),moved=useRef(false),uid=firebaseUser?.uid;
  const name=String(displayName||firebaseUser?.displayName||'Cliente NEXUS').slice(0,80),email=firebaseUser?.email||'';
  const enablePushNotifications=async()=>{
    if(!database||!uid||!app){setPushStatus('error');setPushMessage('Não foi possível conectar ao Firebase.');return;}
    if(!('Notification' in window)||!('serviceWorker' in navigator)){setPushStatus('error');setPushMessage('Este navegador não oferece notificações push.');return;}
    const vapidKey=import.meta.env.VITE_FIREBASE_VAPID_KEY;
    if(!vapidKey){setPushStatus('error');setPushMessage('A chave VAPID ainda precisa ser configurada no Firebase e no Cloudflare Pages.');return;}
    setPushStatus('loading');setPushMessage('');
    try{
      if(!(await isSupported()))throw new Error('Notificações push não são compatíveis com este navegador.');
      const permission=Notification.permission==='granted'?'granted':await Notification.requestPermission();
      if(permission!=='granted')throw new Error('Permissão de notificação não concedida.');
      const workerUrl=new URL('/firebase-messaging-sw.js',window.location.origin);
      Object.entries(firebaseConfigPublic).forEach(([key,value])=>{if(value)workerUrl.searchParams.set(key,value);});
      const registration=await navigator.serviceWorker.register(workerUrl.toString());
      const token=await getToken(getMessaging(app),{vapidKey,serviceWorkerRegistration:registration});
      if(!token)throw new Error('O Firebase não retornou um token para este dispositivo.');
      const tokenKey=encodeURIComponent(token).replace(/\./g,'%2E');
      await set(ref(database,'pushTokens/'+uid+'/'+tokenKey),{token,updatedAt:Date.now(),userAgent:String(navigator.userAgent||'').slice(0,160)});
      setPushStatus('enabled');setPushMessage('Notificações ativadas neste celular.');
    }catch(error){console.error('Falha ao ativar notificações push:',error);setPushStatus('error');setPushMessage(error?.message||'Não foi possível ativar as notificações.');}
  };
  useEffect(()=>{if(new URLSearchParams(window.location.search).get('support')==='1')setOpen(true);},[]);
  useEffect(()=>{
    if(!app||!uid)return undefined;
    let active=true,unsubscribe=()=>{};
    isSupported().then(supported=>{if(!active||!supported)return;try{unsubscribe=onMessage(getMessaging(app),payload=>{if(Notification.permission==='granted'){new Notification(payload.notification?.title||'Nova mensagem · NEXUS AÇÕES',{body:payload.notification?.body||'Você recebeu uma resposta do suporte.',tag:'nexus-support-'+uid});}});}catch(error){console.warn('Não foi possível preparar notificações em primeiro plano:',error);}}).catch(()=>{});
    return()=>{active=false;unsubscribe();};
  },[uid]);
  useEffect(()=>{
    if(!database||!uid)return undefined;
    const profileRef=ref(database,'supportChats/'+uid+'/profile');
    get(profileRef).then(snap=>{if(!snap.exists())return set(profileRef,{uid,displayName:name,email,createdAt:Date.now()});}).catch(error=>console.error('Falha ao iniciar suporte:',error));
    return onValue(ref(database,'supportChats/'+uid+'/messages'),snap=>{
      const raw=snap.val()||{};
      setMessages(Object.entries(raw).map(([id,msg])=>({id,...(msg||{})})).sort((a,b)=>Number(a.createdAt||0)-Number(b.createdAt||0)));
    },error=>console.error('Falha ao carregar suporte:',error));
  },[uid]);
  const send=async(event)=>{
    event.preventDefault();const text=draft.trim();if(!text||busy||!database||!uid)return;setBusy(true);
    try{const messageRef=push(ref(database,'supportChats/'+uid+'/messages'));await set(messageRef,{senderUid:uid,senderRole:'customer',senderName:name,text,createdAt:Date.now()});setDraft('');}
    catch(error){console.error('Falha ao enviar mensagem ao suporte:',error);}
    finally{setBusy(false);}
  };
  const startDrag=(event)=>{
    if(event.button!==undefined&&event.button!==0)return;
    drag.current={left:position?.left??Math.max(12,window.innerWidth-82),top:position?.top??Math.max(12,window.innerHeight-110),startX:event.clientX,startY:event.clientY};moved.current=false;event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const moveDrag=(event)=>{
    if(!drag.current)return;const dx=event.clientX-drag.current.startX,dy=event.clientY-drag.current.startY;
    if(Math.abs(dx)+Math.abs(dy)>6)moved.current=true;if(!moved.current)return;
    setPosition({left:Math.min(Math.max(8,drag.current.left+dx),window.innerWidth-68),top:Math.min(Math.max(8,drag.current.top+dy),window.innerHeight-68)});
  };
  const endDrag=()=>{if(drag.current&&!moved.current)setOpen(value=>!value);drag.current=null;};
  return <><button type="button" aria-label="Abrir suporte" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} style={position?{left:position.left,top:position.top,right:'auto',bottom:'auto'}:{right:18,bottom:92}} className="fixed z-[70] flex h-16 w-16 touch-none select-none items-center justify-center rounded-full border-2 border-white/80 bg-gradient-to-br from-cyan-300 via-sky-500 to-blue-800 text-white shadow-[0_12px_35px_rgba(14,165,233,.5)] ring-4 ring-cyan-300/20"><span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-black text-slate-950">•</span><span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-slate-950/20"><span className="text-[30px] leading-none">🧑‍💻</span><Headset className="absolute -top-1 right-0 text-white drop-shadow" size={17} strokeWidth={2.8}/></span><span className="absolute -bottom-2 rounded-full border border-cyan-100/50 bg-slate-950 px-2 py-0.5 text-[9px] font-black tracking-wide text-cyan-100">SUPORTE</span></button>
  {open?<section className="fixed bottom-5 right-3 z-[80] flex h-[min(560px,78vh)] w-[min(370px,calc(100vw-24px))] flex-col overflow-hidden rounded-3xl border border-cyan-300/30 bg-slate-950 text-white shadow-2xl shadow-slate-950/50"><header className="flex items-center justify-between gap-2 bg-gradient-to-r from-blue-950 via-slate-900 to-cyan-950 p-4"><div className="flex min-w-0 items-center gap-3"><div className="rounded-xl bg-cyan-300/15 p-2 text-cyan-200"><Headset size={22}/></div><div className="min-w-0"><p className="font-black">Suporte NEXUS</p><p className="text-[10px] text-cyan-100/80">Atendimento pelo site</p></div></div><div className="flex shrink-0 items-center gap-1"><button type="button" onClick={enablePushNotifications} disabled={pushStatus==='loading'||pushStatus==='enabled'} aria-label="Ativar notificações neste celular" title="Ativar notificações neste celular" className="rounded-lg p-2 text-cyan-100 hover:bg-white/10 disabled:opacity-60">{pushStatus==='enabled'?<BellRing size={19}/>:<Bell size={19}/>}</button><button onClick={()=>setOpen(false)} aria-label="Fechar suporte" className="rounded-lg p-2 hover:bg-white/10"><X size={19}/></button></div></header><div className="flex-1 space-y-3 overflow-y-auto p-3">{pushMessage?<div role="status" className={"rounded-xl border p-3 text-xs "+(pushStatus==="error"?"border-rose-400/30 bg-rose-950/40 text-rose-100":"border-cyan-300/20 bg-cyan-950/40 text-cyan-100")}>{pushMessage}</div>:null}<div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-3 text-xs leading-relaxed text-cyan-50">Olá! Envie sua dúvida por aqui. Nossa equipe poderá responder diretamente nesta conversa.</div>{messages.map(msg=><div key={msg.id} className={'flex '+(msg.senderRole==='customer'?'justify-end':'justify-start')}><div className={'max-w-[88%] rounded-2xl px-3 py-2.5 '+(msg.senderRole==='customer'?'bg-cyan-500 text-white':'bg-slate-800 text-slate-100')}><p className="whitespace-pre-wrap break-words text-sm">{msg.text}</p><p className="mt-1 text-right text-[9px] opacity-60">{new Date(Number(msg.createdAt||Date.now())).toLocaleString('pt-BR')}</p></div></div>)}</div><form onSubmit={send} className="flex items-end gap-2 border-t border-white/10 bg-slate-900 p-3"><textarea value={draft} onChange={e=>setDraft(e.target.value)} rows={2} maxLength={2000} placeholder="Digite sua dúvida..." className="min-w-0 flex-1 resize-none rounded-xl border border-white/10 bg-slate-950 p-3 text-sm text-white outline-none focus:border-cyan-400" required/><button disabled={busy||!draft.trim()} aria-label="Enviar mensagem" className="rounded-xl bg-cyan-400 p-3 text-slate-950 disabled:opacity-40"><Send size={18}/></button></form><p className="bg-slate-900 px-3 pb-2 text-center text-[9px] text-slate-400">Arraste o botão com fone para mudar de lugar.</p></section>:null}</>;
}
