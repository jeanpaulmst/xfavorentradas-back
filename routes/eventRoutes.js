import express from 'express';
import eventController from '../controllers/eventController.js';

const router = express.Router();

//POST,PUT eventos (ABM)
router.post('/crear-preferencia', eventController.generarPreferencia);
router.post('/crear-evento', eventController.crearEvento);
router.patch('/:eventId/dar-baja', eventController.darBajaEvento);
router.delete('/:eventId/eliminar', eventController.eliminarEvento);
router.put('/:eventId/modificar-evento', eventController.modificarEvento);
router.put('/:preferenceId/modificar-preferencia', eventController.modificarPreferencia);

//GET eventos
router.get('/', eventController.obtenerEventos);
router.get('/:eventId', eventController.obtenerEvento);

export default router;
