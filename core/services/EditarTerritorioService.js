import Environment from "../Environment.js";
import Logger from "../Logger.js";
import Spreadsheet from "../Spreadsheet.js";

function formatNumber(num) {
    return num < 10 ? '0' + num : num.toString();
}

async function insert(endereco) {
    var date = new Date(Date.now());
    var dateAsString = formatNumber(date.getDate()) + "/" + formatNumber(date.getMonth() + 1) + "/" + date.getFullYear();

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

    if (rows[0].filter(x => !!x).length !== rows[0].length) {
        throw new Error("endereço inválido");
    }

    Spreadsheet.appendRows('endereços', rows);
}

// deve ser no padrão abaixo
// const range = 'Página1!A5:C5';
async function update(enderecoAnterior, endereco) {
    var page = 'endereços';
    var line = Spreadsheet.getRowIndexByValue(enderecoAnterior);

    if (line < 1) {
        throw {
            status: 404,
            message: "Endereço não encontrado"
        };
    }

    var row = [
        endereco.cor,
        endereco.cartao,
        endereco.endereco,
        endereco.long,
        endereco.lat
    ];

    await Spreadsheet.updateRows(page, line, row);
}


function EditarTerritorioService() {
    return {
        insert,
        update
    }
}

export default EditarTerritorioService();