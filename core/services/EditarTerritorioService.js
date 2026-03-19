import Environment from "../Environment.js";
import Logger from "../Logger.js";
import Spreadsheet from "../Spreadsheet.js";

function formatNumber(num) {
    return num < 10 ? '0' + num : num.toString();
}

async function log(endereco, mapa, acao, usuario) {
    var row = [
        endereco,
        mapa,
        acao,
        "Sim",
        "Sim",
        usuario,
        new Date().toLocaleDateString('pt-BR')
    ]
    await Spreadsheet.appendRows("atualizacao endereços", [row]);
}

async function insert(endereco, usuario) {
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

    await Spreadsheet.appendRows('endereços', rows);
    await log(endereco.endereco, endereco.cartao, "incluir", usuario);
}


async function update(enderecoAnterior, endereco, usuario) {
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
    await log(endereco.endereco, endereco.cartao, "alterar", usuario);
}

async function remove(endereco, usuario) {
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
    await log(endereco, " - ", "remover", usuario);
}

function EditarTerritorioService() {
    return {
        insert,
        update,
        remove
    }
}

export default EditarTerritorioService();