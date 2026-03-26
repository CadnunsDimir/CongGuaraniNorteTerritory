import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import Logger from './core/Logger.js';
import GlobalExceptionHandler from './core/GlobalExceptionHandler.js';
import Environment from './core/Environment.js';

const port = Environment.PORT;
const app = express();
app.use(express.json());
app.use(cookieParser());

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const loadControllers = async () => {
    const controllersPath = path.join(__dirname, 'core/controller');
    
    // Lê todos os arquivos da pasta
    const files = fs.readdirSync(controllersPath);

    for (const file of files) {
        if (file.endsWith('.js')) {
            const filePath = path.join(controllersPath, file);            
            const controller = await import(`file://${filePath}`);
            
            if (typeof controller.default === 'function') {
                controller.default(app);
                Logger.info(`✅ Controller carregado: ${file}`);
            }
        }
    }
};


loadControllers().then(() => {
    GlobalExceptionHandler(app);

    app.listen(port, () => {
        Logger.info(`🚀 Servidor rodando em http://localhost:${port}`);
    });
}).catch(err => {
    Logger.error('❌ Erro ao carregar controllers:'+err, err.stack);
});
