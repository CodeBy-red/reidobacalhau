const express = require('express');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do Google Sheets
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
const spreadsheetId = process.env.SPREADSHEET_ID;
const range = process.env.RANGE;

const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Endpoint para buscar cardápio
app.get('/api/cardapio', async (req, res) => {
    try {
        const authClient = await auth.getClient();
        await google.auth.setCredentials(authClient.credentials);

        const response = await sheets.spreadsheets.values.get({
            auth: authClient,
            spreadsheetId: spreadsheetId,
            range: range
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'Nenhum dado encontrado' });
        }

        // Converter para formato de objeto
        const headers = rows[0];
        const data = rows.slice(1).map((row, rowIndex) => {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index] || '';
            });
            obj.row_index = rowIndex;
            return obj;
        });

        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar cardápio:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do cardápio' });
    }
});

// Endpoint para buscar estoque
app.get('/api/estoque', async (req, res) => {
    try {
        const authClient = await auth.getClient();
        await google.auth.setCredentials(authClient.credentials);

        const response = await sheets.spreadsheets.values.get({
            auth: authClient,
            spreadsheetId: spreadsheetId,
            range: range
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'Nenhum dado encontrado' });
        }

        // Converter para formato de objeto
        const headers = rows[0];
        const data = rows.slice(1).map((row, rowIndex) => {
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index] || '';
            });
            obj.row_index = rowIndex;
            return obj;
        });

        res.json(data);
    } catch (error) {
        console.error('Erro ao buscar estoque:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do estoque' });
    }
});

// Endpoint para salvar pedidos
app.post('/api/pedidos', async (req, res) => {
    try {
        const { cliente, itens, total, data_pedido } = req.body;

        const authClient = await auth.getClient();
        await google.auth.setCredentials(authClient.credentials);

        // Buscar dados atuais da aba "Pedidos"
        const response = await sheets.spreadsheets.values.get({
            auth: authClient,
            spreadsheetId: spreadsheetId,
            range: 'Pedidos!A:E'
        });

        const rows = response.data.values || [];
        const nextRow = rows.length + 1;

        // Adicionar novo pedido
        const pedidoData = [
            [nextRow, cliente, JSON.stringify(itens), total, data_pedido]
        ];

        await sheets.spreadsheets.values.append({
            auth: authClient,
            spreadsheetId: spreadsheetId,
            range: 'Pedidos!A:E',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [pedidoData]
            }
        });

        res.json({ success: true, message: 'Pedido salvo com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar pedido:', error);
        res.status(500).json({ error: 'Erro ao salvar pedido' });
    }
});

// Endpoint de debug para verificar dados brutos
app.get('/api/debug', async (req, res) => {
    try {
        const authClient = await auth.getClient();
        await google.auth.setCredentials(authClient.credentials);

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

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API Cardápio: http://localhost:${PORT}/api/cardapio`);
    console.log(`API Estoque: http://localhost:${PORT}/api/estoque`);
});

module.exports = app;
