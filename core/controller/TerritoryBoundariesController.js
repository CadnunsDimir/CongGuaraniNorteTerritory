import multer from 'multer';
import path from 'path';
import TerritoryBoundariesService from '../services/TerritoryBoundariesService.js';

const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // No ES Modules, path.extname continua funcionando igual
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.kml') {
            return cb(new Error('Apenas arquivos .kml são permitidos'), false);
        }
        cb(null, true);
    }
});

function TerritoryBoundariesController(app) {
    const base = "/api/territory/boundaries";

    app.post(base, upload.single('map'), async (req, res) => {
        if (!req.file) {
            return res.status(400).send('Nenhum arquivo enviado.');
        }

        const kmlString = req.file.buffer.toString('utf-8');        
        await TerritoryBoundariesService.saveKmlAsPoligon(kmlString);

        res.status(200).json({
            message: 'Arquivo KML recebido com sucesso!',
            filename: req.file.originalname,
            size: req.file.size
        });
    });
    
    app.get(base, async (req, res)=> {
       res.status(200)
        .json(TerritoryBoundariesService.getPoligon());
    });
}

export default TerritoryBoundariesController