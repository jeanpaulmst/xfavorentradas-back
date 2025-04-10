import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import eventRoutes from './routes/eventRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';
import loginRoutes from './routes/loginRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/events', eventRoutes);
app.use('/assistants', assistantRoutes);
app.use('/auth', loginRoutes);

app.get('/', (req, res) => {
  res.send('API de gestión de eventos y asistentes 🎉');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
