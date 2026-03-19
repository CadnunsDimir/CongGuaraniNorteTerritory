import { authenticateApi } from "../Auth.js";
import EditarTerritorioService from "../services/EditarTerritorioService.js";
import GeoCodingService from "../services/GeoCodingService.js";
import TerritorioService from "../services/TerritorioService.js";

function AdressesController(app) {
    const base = "/api/admin/territory";
    const adressesPath = `${base}/adresses`;
    const geocodingPath = `${base}/geocoding`;

    app.post(adressesPath, authenticateApi, async (req, res) => {
        await EditarTerritorioService.insert(req.body, req.user.login);
        await TerritorioService.refreshData();
        res.status(201)
            .json({
                status: 201,
                data: "OK"
            });
    });

    app.put(adressesPath + "/:enderecoAnterior", authenticateApi, async (req, res) => {
        const { enderecoAnterior } = req.params;
        const endereco = req.body;
        
        await EditarTerritorioService.update(enderecoAnterior, endereco, req.user.login);
        await TerritorioService.refreshData();
        
        res.status(200)
            .json({
                status: 200,
                data: "OK"
            });
    });

    app.delete(adressesPath + "/:endereco", authenticateApi, async (req, res) => {
        const { endereco } = req.params;
        await EditarTerritorioService.remove(endereco, req.user.login);
        await TerritorioService.refreshData();
        res.status(200)
            .json({
                status: 200,
                data: "OK"
            });
    });

    app.get(geocodingPath, authenticateApi, async (req, res)=> {
        const userAgent = req.headers['user-agent']
        var data = await GeoCodingService.getCoordinatesByAdress(req.query.streetName, req.query.houseNumber, userAgent);
        res.send(data);
    });
}

export default AdressesController