import express from 'express';
import genreController from '../controllers/genreController'

const router = express.Router();

//POST,PUT eventos (ABM)
router.get('/', genreController.obtenerGeneros);
router.post('/crear-genero', genreController.crearGenero);
router.put('/modificar-genero/:generoId', genreController.modificarGenero);
router.put('/dar-baja-genero/:generoId', genreController.darBajagenero);


export default router;