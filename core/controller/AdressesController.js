import { authenticateApi } from "../Auth.js";
import EditarTerritorioService from "../services/EditarTerritorioService.js";
import TerritorioService from "../services/TerritorioService.js";

function AdressesController(app) {
    const basePath = "/api/admin/territory/adresses";
    app.post(basePath, authenticateApi, async (req, res) => {
        await EditarTerritorioService.insert(req.body);
        await TerritorioService.refreshData();
        res.status(201)
            .json({
                status: 201,
                data: "OK"
            });
    });

    app.put(basePath + "/:enderecoAnterior", authenticateApi, async (req, res) => {
        const { enderecoAnterior } = req.params;
        const endereco = req.body;
        
        await EditarTerritorioService.update(enderecoAnterior, endereco);
        await TerritorioService.refreshData();
        
        res.status(200)
            .json({
                status: 200,
                data: "OK"
            });
    });

    app.delete(basePath + "/:endereco", authenticateApi, async (req, res) => {
        const { endereco } = req.params;
        await EditarTerritorioService.remove(endereco);
        await TerritorioService.refreshData();
        res.status(200)
            .json({
                status: 200,
                data: "OK"
            });
    });
}

export default AdressesController