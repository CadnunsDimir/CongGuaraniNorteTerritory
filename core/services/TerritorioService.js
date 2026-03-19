import Logger from "../Logger.js";
import Utils from "../Utils.js";
import Environment from "../Environment.js";
import Spreadsheet from "../Spreadsheet.js";

const TerritorioService = () => {
    const urlCsv = Utils.toUrl(Environment.dbCsvUrl, { 
        gid: Environment.enderecosGid, 
        output: 'csv' 
    });

    const cardFieldkey = 1;
    const addressFieldKey = 2;
    const latKey = 4;
    const longKey = 3;
    const colorFieldKey = 0;

    var listaEnderecos = [];    

    async function refreshData() {        
        try {
            listaEnderecos = await Spreadsheet.queryRows('\'endereços\'!A2:E');    
        } catch (error) {
            throw new Error("[Localidades] Erro ao consultar dados: "+error);
        }

        Logger.info("[Spreadsheet] [Localidades] Todas as "+ listaEnderecos.length+" enderecos foram carregados!");
    }    
    
    const getByCardNumber = (numeroCartao) => {
        Logger.info("Carregando cartão "+numeroCartao);
        var todosEnderecos = listaEnderecos.filter(endereco => endereco[cardFieldkey] === numeroCartao.toString());
        var corCartao = (todosEnderecos[0] || [])[colorFieldKey] || "#FFFFFF";
        return {
            numeroCartao,
            corCartao,
            enderecos: todosEnderecos.map(e=> ({
                endereco: e[addressFieldKey],
                lat: e[latKey],
                long: e[longKey]
            }))
        }
    }

    const adicionarNovosTerritorios = (listaTerritoriosFixa) => {
        var numerosAtuais = listaTerritoriosFixa.map(x=> x.numeroCartao);
        var novaLista = [...listaTerritoriosFixa]
        listaEnderecos.forEach(x=> {
            if (!listaEnderecos.includes(x)) {
                numerosAtuais.push(x);
                novaLista.push({
                    numeroCartao: x,
                    localidade: x + " - Nova Localidade"
                });
            }
        });
        return novaLista;
    }

    refreshData(()=>{});

    return {
        getByCardNumber,
        adicionarNovosTerritorios,
        refreshData
    }
};

export default TerritorioService();