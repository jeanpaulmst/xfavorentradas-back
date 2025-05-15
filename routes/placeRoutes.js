import express from 'express';
import placeController from '../controllers/placeController.js'

const router = express.Router();

//POST,PUT eventos (ABM)
router.get('/', placeController.obtenerLugares);
router.post('/crear-lugar', placeController.crearLugar);
router.put('/modificar-lugar/:lugarId', placeController.modificarLugar);
router.put('/dar-baja-lugar/:bandId', placeController.darBajaLugar);


export default router;