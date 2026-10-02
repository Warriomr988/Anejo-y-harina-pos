// Servidor de Añejo y Harina (terminal POS): Express + node:sqlite.
// Arranca con: npm run dev   (usa tsx, sin compilación previa)
// Producción:  npm run build && npm start
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { initDb } from './db.js';
import { apiRouter } from './routes.js';

initDb();

const app = express();

// CORS: la app empaquetada con Capacitor corre en un origen distinto
// (capacitor://localhost), así que el API debe aceptar peticiones
// cross-origin (navegador/WebView la bloquearía si no).
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json());

// API bajo /api
app.use('/api', apiRouter);

// En producción, sirve el frontend compilado (client/dist) si existe,
// para que todo corra en un solo servidor/puerto.
const clientDist = path.join(process.cwd(), '..', 'client', 'dist');
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
  console.log(`Sirviendo frontend desde ${clientDist}`);
}

const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  console.log(`Servidor Añejo y Harina escuchando en http://localhost:${PORT}`);
});
