import { authenticate } from "../Auth.js";
import EditarTerritorioService from "../services/EditarTerritorioService.js";

function AdressesController(app) {
    const basePath = "/api/admin/territory/adresses";
    app.post(basePath, authenticate, async (req, res) => {
        if (req.isAuthenticated) {
            await EditarTerritorioService.insert(req.body);
            res.send({
                status: 200,
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