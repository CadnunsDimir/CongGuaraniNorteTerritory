import express from 'express';

import TerritorioController from './core/controller/TerritoryController.js';
import FrontEndController from './core/controller/FrontEndController.js';
import AdminController from './core/controller/AdminController.js';

const port = 3000;
const app = express();
app.use(express.json());

FrontEndController(app);
TerritorioController(app);
AdminController(app);

app.use((err, req, res, next) => {
  var timestamp = new Date().toISOString();
    console.error(timestamp, err);

    const status = err.status || 500;
    const mensagem = err.message || 'Erro interno no servidor';

    res.status(status).json({
        status: status,
        message: mensagem,
        timestamp
    });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
