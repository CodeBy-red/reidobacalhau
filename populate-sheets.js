const { google } = require('googleapis');
require('dotenv').config();

// Configuração Google Sheets
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
const spreadsheetId = process.env.SPREADSHEET_ID;
const range = process.env.RANGE;

const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth });

// Dados completos do cardápio
const menuData = [
    // Pratos Executivos
    ["Tilápia ao Molho Belle Meunière", 49.90, "sim", "executivos", "não", ""],
    ["Filé de Peixe do Rei", 39.90, "sim", "executivos", "não", ""],
    ["Filé de Frango Grelhado", 39.90, "sim", "executivos", "não", ""],
    ["Espaguete à Bolonhesa", 39.90, "sim", "executivos", "não", ""],
    ["Frango à Parmegiana", 39.90, "sim", "executivos", "não", ""],
    ["Jardineira do Rei", 39.90, "sim", "executivos", "não", ""],
    ["Strogonoff de Frango", 39.90, "sim", "executivos", "não", ""],
    ["Strogonoff de Carne", 39.90, "sim", "executivos", "não", ""],
    ["Almôndegas do Rei", 39.90, "sim", "executivos", "não", ""],
    ["Carne Assada com Batata", 39.90, "sim", "executivos", "não", ""],
    ["Rabada do Rei", 39.90, "sim", "executivos", "não", ""],
    ["Bife Acebolado à Cavalo", 39.90, "sim", "executivos", "não", ""],
    ["Feijoada do Rei", 39.90, "sim", "executivos", "não", ""],
    
    // Massas
    ["Risoto de Camarão", 49.90, "sim", "massas", "sim", ""],
    ["Bobó de Camarão", 49.90, "sim", "massas", "sim", ""],
    ["Talharim ao Molho Branco com Camarão", 49.90, "sim", "massas", "sim", ""],
    ["Camarão ao Catupiry", 49.90, "sim", "massas", "sim", ""],
    ["Salmão Grelhado", 59.90, "sim", "massas", "sim", ""],
    ["Paella do Rei", 49.90, "sim", "massas", "sim", ""],
    ["Arroz de Polvo", 49.90, "sim", "massas", "sim", ""],
    ["Medalhão de Salmão", 39.90, "sim", "massas", "não", ""],
    
    // Bacalhau
    ["Arroz de Bacalhau", 49.90, "sim", "bacalhau", "sim", ""],
    ["Bacalhau Gomes de Sá", 59.90, "sim", "bacalhau", "sim", ""],
    ["Bacalhau com Grão de Bico", 59.90, "sim", "bacalhau", "sim", ""],
    ["Bacalhau Gratinado", 59.90, "sim", "bacalhau", "sim", ""],
    ["Bacalhau à Portuguesa", 74.90, "sim", "bacalhau", "sim", ""],
    
    // Caldos
    ["Caldo Verde", 29.90, "sim", "caldos", "não", ""],
    ["Caldo de Ervilha", 29.90, "sim", "caldos", "não", ""],
    ["Canja de Galinha", 29.90, "sim", "caldos", "não", ""],
    ["Caldo de Frutos do Mar", 39.90, "sim", "caldos", "sim", ""]
];

// Função para popular a planilha
async function populateSpreadsheet() {
    try {
        console.log('🚀 Iniciando população da planilha...');
        
        // Preparar dados com cabeçalho
        const data = [
            ["Produto", "Preço", "Disponível", "Categoria", "Especial", "Ingredientes"],
            ...menuData
        ];
        
        // Limpar e popular a aba "Estoque"
        await sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: `${range}!A1:F${data.length}`,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: data
            }
        });
        
        console.log(`✅ ${menuData.length} produtos adicionados com sucesso!`);
        
        // Criar aba "Pedidos" se não existir
        try {
            await sheets.spreadsheets.values.update({
                spreadsheetId: spreadsheetId,
                range: 'Pedidos!A1:E1',
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [["Data", "Cliente", "Itens", "Total", "Status"]]
                }
            });
            console.log('✅ Aba "Pedidos" configurada com sucesso!');
        } catch (error) {
            console.log('ℹ️ Aba "Pedidos" já existe ou não foi possível criar');
        }
        
        // Resumo dos produtos por categoria
        const resumo = {
            executivos: menuData.filter(item => item[3] === 'executivos').length,
            massas: menuData.filter(item => item[3] === 'massas').length,
            bacalhau: menuData.filter(item => item[3] === 'bacalhau').length,
            caldos: menuData.filter(item => item[3] === 'caldos').length
        };
        
        console.log('\n📊 Resumo dos produtos adicionados:');
        console.log(`🍽️  Pratos Executivos: ${resumo.executivos}`);
        console.log(`🍝 Massas: ${resumo.massas}`);
        console.log(`🐟 Bacalhau: ${resumo.bacalhau}`);
        console.log(`🍲 Caldos: ${resumo.caldos}`);
        console.log(`📦 Total: ${menuData.length} produtos`);
        
        console.log('\n🎉 Planilha populada com sucesso!');
        console.log('📱 Acesse: https://docs.google.com/spreadsheets/d/' + spreadsheetId);
        
    } catch (error) {
        console.error('❌ Erro ao popular planilha:', error.message);
        
        if (error.message.includes('permission')) {
            console.log('\n🔧 Solução possível:');
            console.log('1. Compartilhe a planilha com: rei-do-bacalhau@db-reidobacalhau.iam.gserviceaccount.com');
            console.log('2. Dê permissão de "Editor"');
            console.log('3. Execute este script novamente');
        }
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    populateSpreadsheet();
}

module.exports = { populateSpreadsheet };
