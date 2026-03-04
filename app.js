import express from 'express';
import cookieParser from 'cookie-parser';

import TerritorioController from './core/controller/TerritoryController.js';
import FrontEndController from './core/controller/FrontEndController.js';
import AdminController from './core/controller/AdminController.js';
import Logger from './core/Logger.js';

const port = 3000;
const app = express();
app.use(express.json());
app.use(cookieParser());

FrontEndController(app);
TerritorioController(app);
AdminController(app);

app.use((err, req, res, next) => {
    Logger.error(err);
    const status = err.status || 500;
    const mensagem = err.message || 'Erro interno no servidor';

    res.status(status).json({
        status: status,
        message: mensagem,
    });
});

app.listen(port, () => {
  Logger.info(`Servidor rodando em http://localhost:${port}`);
});
