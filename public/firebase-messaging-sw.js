/* Firebase Cloud Messaging: recebe a configuração pública enviada na URL de registro. */
importScripts('https://www.gstatic.com/firebasejs/12.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.6.0/firebase-messaging-compat.js');
const params=new URL(self.location.href).searchParams;
const firebaseConfig={apiKey:params.get('apiKey'),authDomain:params.get('authDomain'),databaseURL:params.get('databaseURL'),projectId:params.get('projectId'),storageBucket:params.get('storageBucket'),messagingSenderId:params.get('messagingSenderId'),appId:params.get('appId')};
if(firebaseConfig.apiKey&&firebaseConfig.projectId&&firebaseConfig.messagingSenderId&&firebaseConfig.appId){
  firebase.initializeApp(firebaseConfig);
  const messaging=firebase.messaging();
  messaging.onBackgroundMessage(payload=>{
    const title=payload.notification?.title||'Nova mensagem · NEXUS AÇÕES';
    self.registration.showNotification(title,{body:payload.notification?.body||'Você recebeu uma resposta do suporte.',icon:'/nexus-banner.png',badge:'/nexus-banner.png',tag:payload.data?.tag||'nexus-support',renotify:true,data:{url:payload.data?.url||'/?support=1'}});
  });
}
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=new URL(event.notification.data?.url||'/?support=1',self.location.origin).href;
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(windows=>{
    for(const client of windows){if(new URL(client.url).origin===self.location.origin){client.navigate(target);return client.focus();}}
    return clients.openWindow(target);
  }));
});
