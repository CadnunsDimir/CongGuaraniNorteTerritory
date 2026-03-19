import Logger from "../Logger.js";
import Spreadsheet from "../Spreadsheet.js";

const ListaTerritorios = [];

async function refresh() {
    var listaCartoes;
    try {
        listaCartoes = await Spreadsheet.queryRows('\'localidades\'!A:C');
    } catch (error) {
        throw new Error("[LoginService] Erro ao consultar dados de login")
    }

    ListaTerritorios.length = 0;
    listaCartoes.forEach(c => {
        if (c[2] !== "localidade" && c[2] !== "Total") {
            ListaTerritorios.push({
                cor: c[0],
                numeroCartao: c[1],
                localidade: c[2]
            });
        }
    });
    Logger.info("[Spreadsheet] [ListaTerritorios] Todos os " + ListaTerritorios.length + " cartoes foram carregados!");
}

refresh();

const ListaTerritorioService = {
    getList: ()=> ListaTerritorios,
    refresh: ()=> refresh()
}

export default ListaTerritorioService;