import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import ListaTerritorios from './core/ListaTerritorios.js';
import TerritorioService from './core/Territorio.js';

const port = 3000;
const apiPath = "/api";
const wwwPath = "/www/";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.get('/', (req, res) => {  
  res.sendFile(path.join(__dirname,wwwPath,'index.html'));
});

app.get('/www/:pathFile', (req, res) => {  
  res.sendFile(path.join(__dirname,wwwPath, req.params.pathFile));
});

app.get(apiPath+"/territorios", (req, res) => {
    res.send(ListaTerritorios);
});

app.get(apiPath+"/territorios/:numeroCartao", (req, res) => {
  res.send(TerritorioService.getByCardNumber(req.params.numeroCartao));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

