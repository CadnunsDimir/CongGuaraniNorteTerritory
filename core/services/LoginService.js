import { randomUUID } from 'crypto';

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
            console.log("usuario: ", db[email])
            if(db[email] && db[email].password === password) {
                db[email].token = randomUUID();
                var validUntil = new Date(Date.now());
                validUntil.setMinutes(validUntil.getMinutes() + tokenLimitTimeInMinutes);
                db[email].validUntil = validUntil;
                return db[email].token;
            }
            throw { message : "Usuário não encontrado ou senha incorreta" , status: 401 };
        },

        tokenIsValid: (authorizazionToken)=> {
            if (authorizazionToken) {
                var tokenArray = authorizazionToken.split(" ");
                if(tokenArray[0] === "Bearer"){
                    for (const key in db) {                    
                        const user = db[key];
                        if(user.token === tokenArray[1] && user.validUntil > new Date(Date.now())) {
                            return true;
                        } 
                    }
                }
            }
            
            return false;
        }
    }
}

export default LoginService()