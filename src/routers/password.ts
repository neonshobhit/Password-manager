import express, { Router, Request, Response } from 'express';
import { user } from '../middleware/user';
import * as Controller from '../controllers/password';

const router: Router = express.Router();

// router.get('/test/:email', Controller.test);
router.get('/mypasswords', user, Controller.myPasswords);
router.post('/add', user, Controller.addPasswords);
router.post('/unlock', user, Controller.unlock);

export default router;