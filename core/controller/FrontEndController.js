import path from 'path';
import LoginService from '../services/LoginService.js';
import { cookieTokenKey } from './AdminController.js';
import Logger from '../Logger.js';

function FrontEndController(app) {    
    const wwwPath = "/www/";
    const templatesPath = "/templates/";
    const __rootFolder = process.cwd();
    
    app.get('/', (req, res) => {
        res.sendFile(path.join(__rootFolder, templatesPath, 'index.html'));
    });

    app.get('/admin', (req, res) => {
        var screen = "login.html";
        if (req.cookies) {
            const token = req.cookies[cookieTokenKey];
            if(LoginService.tokenIsValid(token)){
                screen = "admin-home.html";
            } else {
                Logger.error("Token inválido");
            }
        } else {
            Logger.error("Cookies não encontrado")
        }
       
        res.sendFile(path.join(__rootFolder, templatesPath, screen));
    });

    app.get('/www/:pathFile', (req, res) => {
        res.sendFile(path.join(__rootFolder, wwwPath, req.params.pathFile));
    });
}

export default FrontEndController;