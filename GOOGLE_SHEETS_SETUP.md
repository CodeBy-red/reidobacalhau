# Configuração do Google Sheets - O Rei do Bacalhau

## Estrutura da Planilha

### Aba "Estoque"
Sua planilha deve ter a seguinte estrutura na aba "Estoque":

| Coluna A | Coluna B | Coluna C | Coluna D | Coluna E |
|----------|----------|----------|----------|----------|
| Produto  | Preço    | Quantidade | Categoria | Especial |
| Tilápia ao Molho Belle Meunière | 49.90 | 50 | executivos | não |
| Filé de Peixe do Rei | 39.90 | 30 | executivos | não |
| ... | ... | ... | ... | ... |

### Aba "Pedidos" (opcional)
Esta aba será criada automaticamente para registrar os pedidos:

| Coluna A | Coluna B | Coluna C | Coluna D | Coluna E |
|----------|----------|----------|----------|----------|
| Data     | Cliente  | Itens    | Total    | Status   |

## Configuração Inicial

### 1. Compartilhar a Planilha
1. Abra sua planilha Google Sheets
2. Clique em "Compartilhar" no canto superior direito
3. Adicione o email: `rei-do-bacalhau@db-reidobacalhau.iam.gserviceaccount.com`
4. Dê permissão de "Editor"

### 2. Configurar Colunas
Certifique-se de que a primeira linha contenha os cabeçalhos exatos:
- `Produto` (nome do prato)
- `Preço` (valor numérico)
- `Quantidade` (estoque disponível)
- `Categoria` (executivos, massas, bacalhau, caldos)
- `Especial` (sim/não)

### 3. Preencher Dados
Adicione todos os seus produtos seguindo o exemplo acima.

## Instalação do Backend

### Pré-requisitos
- Node.js instalado na máquina
- Acesso à linha de comando

### Passos

1. **Instalar dependências:**
```bash
cd c:/Users/gl451/OneDrive/Desktop/reidobacalhau
npm install
```

2. **Iniciar o servidor:**
```bash
npm start
```

O servidor será iniciado em `http://localhost:3000`

### Testar API

Abra seu navegador e teste os endpoints:

- **Health Check:** http://localhost:3000/health
- **Cardápio:** http://localhost:3000/api/cardapio
- **Estoque:** http://localhost:3000/api/estoque

## Deploy em Produção

### Opção 1: Heroku
1. Crie conta no Heroku
2. Instale Heroku CLI
3. Execute:
```bash
heroku create seu-nome-de-app
heroku config:set GOOGLE_CREDENTIALS="{"type":"service_account",...}"
heroku config:set SPREADSHEET_ID="1EFdRLmyrLEd-IwfWqznws35aTipxMDqQ3A5vfq_ZjVM"
heroku config:set RANGE="Estoque"
git push heroku main
```

### Opção 2: Vercel
1. Instale Vercel CLI
2. Configure `vercel.json`
3. Execute `vercel --prod`

### Opção 3: Railway
1. Crie conta no Railway
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente

## Variáveis de Ambiente

O sistema espera as seguintes variáveis de ambiente:

```
GOOGLE_CREDENTIALS=JSON_com_credenciais
SPREADSHEET_ID=ID_da_sua_planilha
RANGE=Estoque
PORT=3000
NODE_ENV=production
```

## Funcionalidades Implementadas

### ✅ Carregamento Dinâmico
- Cardápio carregado diretamente do Google Sheets
- Atualização em tempo real do estoque
- Fallback automático para dados estáticos se a API falhar

### ✅ Gestão de Estoque
- Validação de disponibilidade ao adicionar itens
- Alertas de estoque baixo (< 10 unidades)
- Bloqueio de itens indisponíveis
- Atualização automática do estoque após pedidos

### ✅ Registro de Pedidos
- Salvamento automático na aba "Pedidos"
- Data, cliente, itens e total
- Status inicial "Pendente"

### ✅ Validações
- Verificação de estoque antes de finalizar
- Impedir venda acima do disponível
- Mensagens de erro amigáveis

## Segurança

⚠️ **Importante:** As credenciais do Google estão no arquivo `.env` e nunca devem ser expostas no frontend.

- O backend lida com todas as operações sensíveis
- O frontend apenas consome a API
- Credenciais protegidas por variáveis de ambiente

## Monitoramento

### Logs do Sistema
O console mostrará:
- Cardápio carregado com sucesso
- Pedidos salvos
- Erros de conexão
- Atualizações de estoque

### Troubleshooting

**Erro 404 ao carregar cardápio:**
- Verifique se o email de serviço tem permissão de editor
- Confirme o ID da planilha
- Verifique o nome da aba ("Estoque")

**Erro de CORS:**
- Certifique-se que o backend está rodando
- Verifique a configuração de CORS no server.js

**Estoque não atualiza:**
- Verifique se as colunas têm os nomes corretos
- Confira se há valores numéricos na coluna Quantidade

## Backup

Recomendamos:
- Backup semanal da planilha
- Versionamento do código
- Monitoramento dos pedidos

---

**Suporte:** Em caso de dúvidas, verifique os logs do console do navegador e do servidor.
