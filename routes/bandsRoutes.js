import express from 'express';
import bandsController from '../controllers/bandsController.js'

const router = express.Router();

//POST,PUT eventos (ABM)
router.get('/', bandsController.obtenerBandas);
router.post('/crear-banda', bandsController.crearBanda);
router.put('/modificar-banda/:bandId', bandsController.modificarBanda);
router.put('/dar-baja-banda/:bandId', bandsController.darBajabanda);


export default router;