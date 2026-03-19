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


async function update(enderecoAnterior, endereco) {
    var page = 'endereços';
    var enderecoColunm = "C";
    var line;
    try {
        line = await Spreadsheet.getRowIndexByValue(page, enderecoColunm, enderecoAnterior);
    } catch (error) {
        throw {
            status: 500,
            message: "Erro ao consultar endereço: " + error
        };
    }

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

async function remove(endereco) {
    var page = 'endereços';
    var enderecoColunm = "C";
    var line;
    try {
        line = await Spreadsheet.getRowIndexByValue(page, enderecoColunm, endereco);
    } catch (error) {
        throw {
            status: 500,
            message: "Erro ao consultar endereço: " + error
        };
    }

    if (line < 1) {
        throw {
            status: 404,
            message: "Endereço não encontrado"
        };
    }

    await Spreadsheet.deleteRows(page, line);
}

function EditarTerritorioService() {
    return {
        insert,
        update,
        remove
    }
}

export default EditarTerritorioService();