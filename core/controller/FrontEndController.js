import path from 'path';
import { fileURLToPath } from 'url';

function FrontEndController(app) {
    
    const wwwPath = "/www/";
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, wwwPath, 'index.html'));
    });

    app.get('/admin', (req, res) => {
        res.sendFile(path.join(__dirname, wwwPath, 'admin.html'));
    });

    app.get('/www/:pathFile', (req, res) => {
        res.sendFile(path.join(__dirname, wwwPath, req.params.pathFile));
    });
}

export default FrontEndController;