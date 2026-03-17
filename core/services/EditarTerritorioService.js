import Environment from "../Environment.js";
import { google } from 'googleapis';
import path from 'path';
import Logger from "../Logger.js";

const __rootFolder = process.cwd();
const KEYFILEPATH = path.join(__rootFolder, 'google_auth', 'credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

async function getSheetsClient() {
  const client = await auth.getClient();
  return google.sheets({ version: 'v4', auth: client });
}

var sheets = await getSheetsClient();

async function insert(endereco) {
    var range = '\'endereços\'!A1';

    const rows = [
        [
            endereco.cor,
            endereco.cartao,
            endereco.endereco,
            endereco.long,
            endereco.lat
        ]
    ];

    const resource = {
        values: rows,
    };

    try {

        Logger.info('Tentando acessar a planilha:', Environment.spreadsheetId);
        Logger.info('No intervalo:', range);

        const result = await sheets.spreadsheets.values.append({
            spreadsheetId: Environment.spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: resource,
        });
        Logger.info(`${result.data.updates.updatedCells} células inseridas.`);
    } catch (err) {
        Logger.error('Erro ao inserir:', err);
    }
}

// deve ser no padrão abaixo
// const range = 'Página1!A5:C5';
async function update(celulas, endereco) {
    const range = 'endereços!'+celulas;

    const rows = [
        [
            endereco.cor,
            endereco.cartao,
            endereco.endereco,
            endereco.long,
            endereco.lat
        ]
    ];

    const resource = {
        values: rows,
    };

    try {
        const result = await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            requestBody: resource,
        });
        Logger.info('Linha atualizada com sucesso.');
    } catch (err) {
        Logger.error('Erro ao editar:', err);
    }
}


function EditarTerritorioService() {
    return {
        insert,
        update
    }
}

export default EditarTerritorioService();