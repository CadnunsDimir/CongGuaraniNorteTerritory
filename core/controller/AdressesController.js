import { authenticate } from "../Auth.js";
import EditarTerritorioService from "../services/EditarTerritorioService.js";
import TerritorioService from "../services/TerritorioService.js";

function AdressesController(app) {
    const basePath = "/api/admin/territory/adresses";
    app.post(basePath, authenticate, async (req, res) => {
        if (req.isAuthenticated) {
            await EditarTerritorioService.insert(req.body);
            await TerritorioService.refreshData();
            res.status(201)
                .json({
                    status: 201,
                    data: "OK"
                });            
        } else {
            throw { 
                message: "Usuário não autenticado",
                status: 401
            };
        }        
    });
}

export default AdressesController