import TerritorioService from '../services/TerritorioService.js';
import ListaTerritorioService from '../services/ListaTerritoriosService.js';
import LoginService from '../services/LoginService.js';

function TerritorioController(app) {
    const apiPath = "/api";
    
    app.get(apiPath + "/territorios", (req, res) => {
        res.send(TerritorioService.adicionarNovosTerritorios(ListaTerritorioService.getList()));
    });

    app.get(apiPath + "/territorios/refresh", async (req, res) => {
        await ListaTerritorioService.refresh();
        await LoginService.refreshDb();
        await TerritorioService.refreshData();
        res.send({
            status: 200,
            response: "OK"
        })
    });

    app.get(apiPath + "/territorios/:numeroCartao", (req, res) => {
        res.send(TerritorioService.getByCardNumber(req.params.numeroCartao));
    });

}

export default TerritorioController;