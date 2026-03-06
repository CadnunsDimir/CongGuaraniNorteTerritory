import { randomUUID } from 'crypto';
import Logger from '../Logger.js';
import Environment from "../Environment.js";
import Utils from "../Utils.js";

function LoginService() {
    var tokenLimitTimeInMinutes = 30;
    var db = {};

    function refreshDb() {
        const urlCsvLocalidades = Utils.toUrl(Environment.dbCsvUrl, {
            gid: Environment.loginsGid,
            output: 'csv'
        });

        fetch(urlCsvLocalidades)
            .then(response => response.text())
            .then(data => {
                var tabelaLogins = Utils.parseCSV(data);               

                db = {};
                for (let index = 0; index < tabelaLogins.length; index++) {
                    const loginRow = tabelaLogins[index];
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
                }
                Logger.info("[CSV] [Login] Todos os " + (tabelaLogins.length - 1) + " logins foram carregados!");
            })
            .catch(error => Logger.error("Erro ao buscar dados:", error));
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
                login.token = randomUUID();
                var validUntil = new Date(Date.now());
                validUntil.setMinutes(validUntil.getMinutes() + tokenLimitTimeInMinutes);
                login.validUntil = validUntil;
                Logger.info("token gerado ", login.token);
                return login.token;
            }
            throw { message : "Usuário não encontrado ou senha incorreta" , status: 401 };
        },

        tokenIsValid: (authorizazionToken)=> {
            if (authorizazionToken) {
                var token = authorizazionToken.replace("Bearer ");
                for (const key in db) {                    
                    const user = db[key];
                    if(user.token === token && user.validUntil > new Date(Date.now())) {
                        return true;
                    } 
                }
            }            
            return false;
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