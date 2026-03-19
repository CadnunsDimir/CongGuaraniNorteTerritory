import { google } from 'googleapis';
import path from 'path';
import Environment from "./Environment.js";
import Logger from './Logger.js';

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

var appendRows = async (page, rows) =>{
    var range = `\'${page}\'!A1`;

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

var queryRows = async (range) => {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: Environment.spreadsheetId,
            range,
        });

        const rows = response.data.values;

        if (!rows || rows.length === 0) {
            Logger.info('Nenhum dado encontrado na planilha.');
            return;
        }

        return rows;
    } catch (err) {
        Logger.error('Erro ao ler a planilha:', err);
    }
}

var Spreadsheet = (() =>{
    return {
        appendRows,
        queryRows
    }
})();

export default Spreadsheet