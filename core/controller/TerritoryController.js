import TerritorioService from '../services/TerritorioService.js';
import GetListaTerritorios from '../services/ListaTerritoriosArray.js';

function TerritorioController(app) {
    const apiPath = "/api";
    
    app.get(apiPath + "/territorios", (req, res) => {
        res.send(TerritorioService.adicionarNovosTerritorios(GetListaTerritorios()));
    });

    app.get(apiPath + "/territorios/refresh", (req, res) => {
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