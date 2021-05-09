import express, { Router, Request, Response } from 'express';
import * as Controller from '../controllers/user';

const router: Router = express.Router();

router.get('/login/:email', Controller.login);
router.post('/totpverify/:email', Controller.totpverify);

export default router;