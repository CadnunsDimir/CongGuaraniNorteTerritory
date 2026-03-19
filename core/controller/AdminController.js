import { authenticateApi } from "../Auth.js";
import LoginService from "../services/LoginService.js";

export const cookieTokenKey = "guarani_token";

function AdminController(app) {
    const basePath = "/api/admin";
    function validateLoginBody(data) {
        if (!data || !data.email || !data.password) {
            throw {
                message: "Favor informar 'email' e 'password'",
                status: 401
            };
        }
    }

    app.post(basePath + '/login', (req, res) => {
        validateLoginBody(req.body);
        var token = LoginService.login(req.body.email, req.body.password);
        var validadeTokenMinutos = 60;
        res.cookie(cookieTokenKey, token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: validadeTokenMinutos * 60000
        });

        res.send({
            status: 200
        });
    });


    app.get(basePath + "/user", authenticateApi, (req, res) => {
        return res.send({
            message: "Usuário logado via Cookie JWT",
            data: req.user
        });
    });

    app.get(basePath + '/logout', authenticateApi, (req, res) => {
        res.clearCookie(cookieTokenKey, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });

        return res.status(200).json({ message: "Logout realizado com sucesso!" });
    });
}

export default AdminController;