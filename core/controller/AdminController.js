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
        var validadeTokenMinutos = 15;
        res.cookie(cookieTokenKey, token, {
            httpOnly: true, 
            secure: true, 
            sameSite: 'strict',
            maxAge: validadeTokenMinutos * 60000
        });

        res.send({
            status: 200,
            response: {
                token
            }
        });
    });

    app.get(basePath + "/islogged", (req, res)=>{
        if (LoginService.tokenIsValid(req.headers.authorization)) {
            return res.send({
                message: "Usuário logado via Bearer token"
            });
        } else if (LoginService.tokenIsValid(req.cookies[cookieTokenKey])) {
            return res.send({
                message: "Usuário logado via Bearer token"
            });
        }
        throw new Error("Usuário nao logado");
    });

    app.get(basePath + "/user", (req, res)=>{
        if (LoginService.tokenIsValid(req.headers.authorization)) {
            return res.send({
                message: "Usuário logado via Bearer token",
                data: LoginService.findLoginByToken(req.headers.authorization)
            });
        } else if (LoginService.tokenIsValid(req.cookies[cookieTokenKey])) {
            return res.send({
                message: "Usuário logado via Bearer token",
                data: LoginService.findLoginByToken(req.cookies[cookieTokenKey])
            });
        }
        throw new Error("Usuário nao logado");
    });

    app.get(basePath + '/logout', (req, res) => {
        res.clearCookie(cookieTokenKey, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });

        return res.status(200).json({ message: "Logout realizado com sucesso!" });
    });
}

export default AdminController;