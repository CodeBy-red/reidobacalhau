# Deploy na Vercel - O Rei do Bacalhau

## 📋 Pré-requisitos

1. **Conta na Vercel**: https://vercel.com
2. **Repositório no GitHub**: Já configurado
3. **Variáveis de Ambiente**: Configurar no dashboard da Vercel

## 🔧 Configuração de Variáveis de Ambiente

No dashboard da Vercel, vá em **Settings > Environment Variables** e adicione:

```
GOOGLE_CREDENTIALS=COLE_AQUI_SUA_CREDENCIAL_JSON_COMPLETA
SPREADSHEET_ID=1EFdRLmyrLEd-IwfWqznws35aTipxMDqQ3A5vfq_ZjVM
RANGE=Estoque
NODE_ENV=production
```

**Importante**: Cole a credencial JSON completa em uma linha, sem quebras.

## 🚀 Passos para Deploy

### Opção 1: Pelo Dashboard Vercel

1. Acesse https://vercel.com/new
2. Importe o repositório: `CodeBy-red/reidobacalhau`
3. Configure as variáveis de ambiente
4. Clique em **Deploy**

### Opção 2: Pelo Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Fazer deploy
vercel --prod
```

## 📁 Estrutura do Projeto para Vercel

```
reidobacalhau/
├── api/index.js          # Backend (Serverless)
├── index.html            # Frontend
├── css/style.css         # Estilos
├── js/script.js         # JavaScript
├── img/                # Imagens
├── vercel.json         # Configuração Vercel
└── package.json        # Dependências
```

## 🔗 URLs após Deploy

- **Site Principal**: `https://seu-projeto.vercel.app`
- **API Endpoints**: `https://seu-projeto.vercel.app/api/*`
- **Health Check**: `https://seu-projeto.vercel.app/health`

## 🛠️ Configurações Especiais

### vercel.json
- Configura rotas para API
- Define builds para Node.js e arquivos estáticos
- Configura variáveis de ambiente

### api/index.js
- Backend adaptado para serverless
- Mesma funcionalidade do server.js
- Otimizado para Vercel

## 🔍 Testes Após Deploy

1. **Acesse o site**: Verifique se carrega corretamente
2. **Teste a API**: `https://seu-projeto.vercel.app/api/cardapio`
3. **Verifique imagens**: Logo e banner devem aparecer
4. **Teste carrinho**: Adicionar produtos e finalizar
5. **Teste WhatsApp**: Verificar redirecionamento

## 🐛 Troubleshooting

### Erro 500 - API
- Verifique variáveis de ambiente
- Confirme credenciais do Google Sheets
- Verifique permissões da planilha

### Imagens não carregam
- Verifique caminhos no HTML
- Confirme arquivos na pasta img/
- Limpe cache do navegador

### CORS errors
- Verifique configuração no vercel.json
- Confirme rotas API

## 📈 Monitoramento

A Vercel oferece:
- **Analytics**: Tráfego e performance
- **Logs**: Erros e acessos
- **Functions**: Uso da API
- **Deployments**: Histórico de deploys

## 🔄 Atualizações

Para fazer novas atualizações:

1. **Commit no GitHub**:
   ```bash
   git add .
   git commit -m "Atualização"
   git push origin main
   ```

2. **Deploy automático** na Vercel (se configurado)

3. **Deploy manual**:
   ```bash
   vercel --prod
   ```

## 🎉 Resultado Final

Site profissional com:
- ✅ Frontend responsivo
- ✅ Backend serverless
- ✅ Integração com Google Sheets
- ✅ Deploy automático
- ✅ SSL gratuito
- ✅ CDN global
- ✅ Performance otimizada
