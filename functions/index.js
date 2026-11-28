const {onValueCreated}=require('firebase-functions/v2/database');
const {initializeApp}=require('firebase-admin/app');
const {getDatabase}=require('firebase-admin/database');
const {getMessaging}=require('firebase-admin/messaging');

initializeApp({databaseURL:'https://nexus-acoes-default-rtdb.firebaseio.com'});

exports.notifyCustomerOfSupportReply=onValueCreated({
  ref:'/supportChats/{uid}/messages/{messageId}',
  region:'us-central1',
  retry:true,
},async(event)=>{
  const message=event.data.val()||{};
  if(message.senderRole!=='admin')return;
  const uid=event.params.uid;
  const text=String(message.text||'').trim();
  if(!text)return;
  const snapshot=await getDatabase().ref('pushTokens/'+uid).get();
  if(!snapshot.exists())return;
  const entries=Object.entries(snapshot.val()||{}).filter(([,item])=>item&&typeof item.token==='string'&&item.token.length>20);
  if(!entries.length)return;
  for(let i=0;i<entries.length;i+=500){
    const chunk=entries.slice(i,i+500);
    const response=await getMessaging().sendEachForMulticast({
      tokens:chunk.map(([,item])=>item.token),
      notification:{title:'Nova mensagem do suporte · NEXUS AÇÕES',body:text.slice(0,140)},
      data:{url:'/?support=1',tag:'nexus-support-'+uid},
      webpush:{fcmOptions:{link:'/?support=1'},notification:{icon:'/nexus-banner.png',badge:'/nexus-banner.png',tag:'nexus-support-'+uid,renotify:true}},
    });
    const invalid=[];
    response.responses.forEach((result,index)=>{
      const code=result.error?.code||'';
      if(code==='messaging/registration-token-not-registered'||code==='messaging/invalid-registration-token')invalid.push(chunk[index][0]);
    });
    if(invalid.length){const updates={};invalid.forEach(key=>updates[key]=null);await getDatabase().ref('pushTokens/'+uid).update(updates);}
  }
});
