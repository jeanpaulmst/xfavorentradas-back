import express from 'express';
import assistantController from '../controllers/assistantController.js';

const router = express.Router();

// Webhook de MercadoPago
router.post('/webhook', assistantController.recibirWebhook);

// Obtener asistentes de un evento
router.get('/:eventId/asistentes', assistantController.obtenerAsistentes);

// Ruta de prueba para ver info de un pago
router.get('/test/user', assistantController.obtenerDatosPago);

export default router;
