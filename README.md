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
