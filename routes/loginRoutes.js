import express from 'express';
import loginController from '../controllers/loginController.js'

const router = express.Router();

//POST,PUT eventos (ABM)
router.get('/', loginController.test);
router.post('/login', loginController.login);

export default router;