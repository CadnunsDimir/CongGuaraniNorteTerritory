import { randomUUID } from 'crypto';
import Logger from '../Logger.js';

function LoginService() {
    var tokenLimitTimeInMinutes = 30;
    var db = {
        "admin@admin.com": {
            email: "admin@admin.com",
            password: "falconfx",
            token: null,
            validUntil: null
        }
    }

    return {
        login: (email, password)=> {
            if(db[email] && db[email].password === password) {
                db[email].token = randomUUID();
                var validUntil = new Date(Date.now());
                validUntil.setMinutes(validUntil.getMinutes() + tokenLimitTimeInMinutes);
                db[email].validUntil = validUntil;
                Logger.info("token gerado ", db[email].token);
                return db[email].token;
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
        }
    }
}

export default LoginService()