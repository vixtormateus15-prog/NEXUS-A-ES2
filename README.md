# NEXUS AÇÕES — projeto React para Termux

## Instalação no Termux

```bash
cd ~/nexus-acoes
npm install
npm run dev -- --host 0.0.0.0
```

Abra no navegador do celular o endereço local mostrado pelo Vite (normalmente `http://localhost:5173`). Para parar, pressione `Ctrl+C` no Termux.

## Firebase

O projeto inclui o SDK do Firebase e `src/firebase.js` preparado para Firebase Authentication e Realtime Database. Para configurar, copie `.env.example` para `.env` e preencha os campos com a configuração do app Web no Firebase Console. Não publique o arquivo `.env` no GitHub.

A interface original ainda usa estado local para simulações. A presença do SDK não significa que cadastro, saldo, depósitos, investimentos ou saques estejam integrados ao Firebase. Não use dinheiro real nem habilite pagamentos/saques reais sem backend confiável, validação no servidor e análise jurídica/regulatória. As regras atuais do banco bloqueiam gravações em carteiras, investimentos e transações; mantenha essa proteção.

## Notificações push do suporte

- No Firebase Console, abra **Configurações do projeto → Cloud Messaging → Web Push certificates** e gere/ copie a chave pública VAPID.
- Cadastre essa chave como variável de ambiente `VITE_FIREBASE_VAPID_KEY` no Cloudflare Pages (Production e Preview, se desejar) e também no arquivo local `.env` para testes. Não coloque a chave privada no frontend.
- Confirme que o app Web tem o Firebase Cloud Messaging habilitado e que os campos públicos do Firebase já estão configurados no Cloudflare Pages.
- As notificações são ativadas pelo próprio cliente: ele abre o chat do suporte e toca no ícone de sino, aceitando a permissão do navegador.
- Para enviar as notificações em segundo plano, o projeto inclui uma Cloud Function que reage a novas mensagens do administrador. A publicação da função exige que o projeto Firebase esteja no plano Blaze (com faturamento configurado) e que o Cloud Messaging esteja habilitado.

Depois de configurar a VAPID e o faturamento, no Termux execute:

```bash
cd ~/nexus-acoes/nexus-acoes
git pull --ff-only origin main
npm install
npm run build
firebase deploy --only database,functions --project nexus-acoes
```

O deploy de `database` publica a regra que permite a cada cliente salvar apenas os próprios tokens de notificação. A Cloud Function envia o push somente quando uma mensagem nova do administrador é gravada em `supportChats/{uid}/messages`. O deploy do Cloudflare Pages continua sendo feito pelo pipeline conectado ao GitHub.
