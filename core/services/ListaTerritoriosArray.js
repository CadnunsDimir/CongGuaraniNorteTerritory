import Utils from "../Utils.js";

const ListaTerritorios = [];

//para conseguir trazer os resultados de outras abas da planilha precisa passar o gid da aba
var urlCsvLocalidades = "XPTO?output=csv&gid=1576675342";


fetch(urlCsvLocalidades)
    .then(response => response.text())
    .then(data => {
        var listaCartoes = Utils.parseCSV(data);
        console.log("[CSV] Todos os " + listaCartoes.length + " cartoes foram carregados!");

        ListaTerritorios.length = 0;
        ListaTerritorios.push(

        );
        listaCartoes.forEach(c => {
            if (c[2] !== "localidade" && c[2] !== "Total") {
                ListaTerritorios.push({
                    numeroCartao: c[1],
                    localidade: c[2]
                });
            }
        })
    })
    .catch(error => console.error("Erro ao buscar dados:", error));

const GetListaTerritorios = () => {
    return ListaTerritorios;
}

export default GetListaTerritorios;