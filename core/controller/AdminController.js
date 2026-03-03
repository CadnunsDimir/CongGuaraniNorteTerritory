import LoginService from "../services/LoginService.js";

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
                data: "OK"
            });
        }
        throw new Error("Usuário nao logado");
    });
}

export default AdminController;