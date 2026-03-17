import path from 'path';
import Logger from '../Logger.js';
import { authenticate } from '../Auth.js';

function FrontEndController(app) {
    const wwwPath = "/www/";
    const templatesPath = "/templates/";
    const __rootFolder = process.cwd();

    app.get('/', (req, res) => {
        res.sendFile(path.join(__rootFolder, templatesPath, 'index.html'));
    });

    app.get('/admin', authenticate, (req, res) => {
        var screen = "login.html";
        if (req.isAuthenticated) {
            screen = "admin-home.html";
        } else {
            Logger.error("Token inválido");
        }
        res.sendFile(path.join(__rootFolder, templatesPath, screen));
    });

    app.get('/admin/complete-map', authenticate, (req, res) => {
        if (req.isAuthenticated) {
            return res.sendFile(path.join(__rootFolder, templatesPath, "complete-map.html"));
        } else {
            Logger.error("Token inválido");
        }
        res.redirect("/admin");
    });

    app.get('/www/:pathFile', (req, res) => {
        res.sendFile(path.join(__rootFolder, wwwPath, req.params.pathFile));
    });
}

export default FrontEndController;