import EditarTerritorioService from "../services/EditarTerritorioService.js";
import LoginService from "../services/LoginService.js";
import { cookieTokenKey } from "./AdminController.js";

function AdressesController(app) {
    const basePath = "/api/admin/territory/adresses";
    app.post(basePath, async (req, res) => {
        if (LoginService.tokenIsValid(req.cookies[cookieTokenKey])) {
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