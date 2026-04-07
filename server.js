const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Servir arquivos estáticos

// Configuração Google Sheets
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
const spreadsheetId = process.env.SPREADSHEET_ID;
const range = process.env.RANGE;

const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

// Função para autenticar e obter cliente
async function getAuthClient() {
    const authClient = await auth.getClient();
    return authClient;
}

// Endpoint para obter dados do estoque
app.get('/api/estoque', async (req, res) => {
    try {
        const authClient = await getAuthClient();
        const response = await sheets.spreadsheets.values.get({
            auth: authClient,
            spreadsheetId: spreadsheetId,
            range: range
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'Nenhum dado encontrado' });
        }

        console.log('Dados brutos do Google Sheets (primeiras 3 linhas):', rows.slice(0, 3));
        console.log('Cabeçalhos:', rows[0]);
        console.log('Primeira linha de dados:', rows[1]);

        // Converter para formato de objeto
        const headers = rows[0];
        const data = rows.slice(1).map((row, rowIndex) => {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index] || '';
            });
            
            // Debug para cada linha
            if (rowIndex < 3) {
                console.log(`Processando linha ${rowIndex + 1}:`, {
                    produto: obj.Produto,
                    preco: obj.Preço,
                    disponivel: obj.Disponível
                });
            }
            
            return obj;
        });

        console.log('Dados processados (primeiros 3 itens):', data.slice(0, 3));
        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar estoque:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do estoque' });
    }
});

// Endpoint para atualizar estoque
app.put('/api/estoque/:rowIndex', async (req, res) => {
    try {
        const { rowIndex } = req.params;
        const { quantidade } = req.body;

        const authClient = await getAuthClient();
        const rangeUpdate = `${range}!A${parseInt(rowIndex) + 2}:Z${parseInt(rowIndex) + 2}`;

        // Primeiro, obter os dados atuais
        const currentData = await sheets.spreadsheets.values.get({
            auth: authClient,
            spreadsheetId: spreadsheetId,
            range: rangeUpdate
        });

        const row = currentData.data.values[0];
        if (!row) {
            return res.status(404).json({ error: 'Linha não encontrada' });
        }

        // Atualizar apenas a coluna de quantidade (assumindo que está na coluna 3)
        row[2] = quantidade.toString();

        await sheets.spreadsheets.values.update({
            auth: authClient,
            spreadsheetId: spreadsheetId,
            range: rangeUpdate,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [row]
            }
        });

        res.json({ success: true, message: 'Estoque atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar estoque:', error);
        res.status(500).json({ error: 'Erro ao atualizar estoque' });
    }
});

// Endpoint para salvar pedidos
app.post('/api/pedidos', async (req, res) => {
    try {
        const { cliente, itens, total, data_pedido } = req.body;

        const authClient = await getAuthClient();
        const pedidoRange = 'Pedidos'; // Nova aba para pedidos

        // Adicionar nova linha na aba de pedidos
        const newRow = [
            data_pedido || new Date().toLocaleString('pt-BR'),
            cliente || 'Não informado',
            itens.map(item => `${item.name} x ${item.quantity}`).join(', '),
            `R$ ${total.toFixed(2)}`,
            'Pendente'
        ];

        await sheets.spreadsheets.values.append({
            auth: authClient,
            spreadsheetId: spreadsheetId,
            range: pedidoRange,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [newRow]
            }
        });

        res.json({ success: true, message: 'Pedido salvo com sucesso' });
    } catch (error) {
        console.error('Erro ao salvar pedido:', error);
        res.status(500).json({ error: 'Erro ao salvar pedido' });
    }
});

// Endpoint para obter cardápio (com estoque)
app.get('/api/cardapio', async (req, res) => {
    try {
        const authClient = await getAuthClient();
        const response = await sheets.spreadsheets.values.get({
            auth: authClient,
            spreadsheetId: spreadsheetId,
            range: range
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'Nenhum dado encontrado' });
        }

        const headers = rows[0];
        const cardapio = rows.slice(1).map((row, index) => {
            const obj = {};
            headers.forEach((header, headerIndex) => {
                obj[header.toLowerCase().replace(/\s+/g, '_')] = row[headerIndex] || '';
            });
            obj.row_index = index; // Adicionar índice para atualizações
            return obj;
        });

        res.json(cardapio);
    } catch (error) {
        console.error('Erro ao buscar cardápio:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do cardápio' });
    }
});

// Endpoint de debug para verificar dados brutos
app.get('/api/debug', async (req, res) => {
    try {
        const authClient = await getAuthClient();
        const response = await sheets.spreadsheets.values.get({
            auth: authClient,
            spreadsheetId: spreadsheetId,
            range: range
        });

        const rows = response.data.values;
        res.json({
            totalRows: rows ? rows.length : 0,
            headers: rows ? rows[0] : [],
            firstDataRow: rows ? rows[1] : [],
            rawSample: rows ? rows.slice(0, 3) : []
        });
    } catch (error) {
        console.error('Erro no debug:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API Cardápio: http://localhost:${PORT}/api/cardapio`);
    console.log(`API Estoque: http://localhost:${PORT}/api/estoque`);
});

module.exports = app;
