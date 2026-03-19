import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import Logger from '../Logger.js';
import Environment from "../Environment.js";
import Utils from "../Utils.js";
import Spreadsheet from '../Spreadsheet.js';

function LoginService() {
    var tokenLimitTimeInMinutes = 30;
    var db = {};

    async function refreshDb() {        
        var rows;
        try {            
            rows = await Spreadsheet.queryRows('\'usuarios_app\'!A2:C');  
        } catch (error) {
            throw new Error("[LoginService] Erro ao consultar dados de login")
        }

        rows.forEach(loginRow => {
            var email = loginRow[1];
            var login = loginRow[0];
            var password = loginRow[2];
            db[email] = {
                email,
                login,
                password,
                token: null,
                validUntil: null
            };
        });

        Logger.info("[Spreadsheet] [Login] Todos os " + rows.length + " logins foram carregados!");
    }

    refreshDb();

    function findLogin(emailOrUserName) {
        for (const email in db) {        
            const login = db[email];
            if(email === emailOrUserName || login.email === emailOrUserName || login.login === emailOrUserName){
                return login;
            }
        }
        return null;
    }

    return {
        login: (email, password)=> {
            var login = findLogin(email);
            if(login && login.password === password) {

                const user = {
                    email: login.email,
                    login: login.login
                };

                const bearerToken = jwt.sign(user, Environment.AUTH_SECRET_KEY, { expiresIn: '1h' });
                login.token = bearerToken;
                var validUntil = new Date(Date.now());
                validUntil.setMinutes(validUntil.getMinutes() + tokenLimitTimeInMinutes);
                login.validUntil = validUntil;
                Logger.info("token gerado ***");
                return login.token;
            }
            throw { message : "Usuário não encontrado ou senha incorreta" , status: 401 };
        },

        refreshDb,

        findLoginByToken: (authorizazionToken)=> {
            var token = authorizazionToken.replace("Bearer ");
            for (const key in db) {                    
                const user = db[key];
                if(user.token === token) {
                    var {email, login} = user;
                    return { email, login };
                }
            }
            return null;
        }
    }
}

export default LoginService()