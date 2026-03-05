import TerritorioService from '../services/TerritorioService.js';
import ListaTerritorioService from '../services/ListaTerritoriosService.js';

function TerritorioController(app) {
    const apiPath = "/api";
    
    app.get(apiPath + "/territorios", (req, res) => {
        res.send(TerritorioService.adicionarNovosTerritorios(ListaTerritorioService.getList()));
    });

    app.get(apiPath + "/territorios/refresh", (req, res) => {
        ListaTerritorioService.refresh();
        TerritorioService.refreshData(() =>
            res.send({
                status: 200,
                response: "OK"
            })
        );
    });

    app.get(apiPath + "/territorios/:numeroCartao", (req, res) => {
        res.send(TerritorioService.getByCardNumber(req.params.numeroCartao));
    });

}

export default TerritorioController;