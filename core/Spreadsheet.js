import { google } from 'googleapis';
import path from 'path';
import Environment from "./Environment.js";
import Logger from './Logger.js';

const __rootFolder = process.cwd();
const KEYFILEPATH = path.join(__rootFolder, 'google_auth', 'credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const spreadsheetId = Environment.spreadsheetId;

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

        Logger.info('Tentando acessar a planilha:', spreadsheetId);
        Logger.info('No intervalo:', range);

        const result = await sheets.spreadsheets.values.append({
            spreadsheetId,
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

var getRowIndexByValue = async (page, colunmLetter, searchedValue) => {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${page}!${colunmLetter}:${colunmLetter}`, 
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
        Logger.info('Planilha vazia.');
        return -1;
    }

    const rowIndex = rows.findIndex(row => row[0] === searchedValue.trim());
    return rowIndex + 1;
}

var updateRows = async (page, rowIndex, row) => {
    var updateDateColumn = "G";

    const resource = {
        values: [
            row
        ]
    };

    const updateDateValue = {
        values: [[new Date().toLocaleDateString('pt-BR')]]
    };

    var updateDateRange = `${page}!${updateDateColumn}${rowIndex}`;
    var rowRange = `${page}!A${rowIndex}:E${rowIndex}`;

    Logger.info("[Endereço] celulas que serão editadas", rowRange, updateDateRange);
    Logger.info(resource.values);
    Logger.info(updateDateValue.values);

    try {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: updateDateRange,
            valueInputOption: 'USER_ENTERED',
            requestBody: updateDateValue,
        });

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: rowRange,
            valueInputOption: 'USER_ENTERED',
            requestBody: resource,
        });

        Logger.info(`[${page.toUpperCase()}] Linha ${rowIndex} atualizada com sucesso.`, );
    } catch (err) {
        Logger.error(`[${page.toUpperCase()}] Erro ao editar linha  ${rowIndex}: `, err);
    }
}

var Spreadsheet = (() =>{
    return {
        appendRows,
        queryRows,
        getRowIndexByValue,
        updateRows
    }
})();

export default Spreadsheet