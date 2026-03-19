import Environment from "../Environment.js";
import Logger from "../Logger.js";
import Spreadsheet from "../Spreadsheet.js";

function formatNumber(num) {
    return num < 10 ? '0'+num : num.toString();
}

async function insert(endereco) {    
    var date = new Date(Date.now());
    var dateAsString = formatNumber(date.getDate())+"/"+formatNumber(date.getMonth()+1)+"/"+date.getFullYear();

    const rows = [
        [
            endereco.cor,
            endereco.cartao,
            endereco.endereco,
            endereco.long,
            endereco.lat,
            dateAsString,
            dateAsString
        ]
    ];

    if(rows[0].filter(x=> !!x).length !== rows[0].length){
        throw new Error("endereço inválido");
    }

    Spreadsheet.appendRows('endereços', rows);    
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