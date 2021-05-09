import db from '../../config/firestore';
import { Request, Response, RequestHandler } from 'express';
import { encode, decode } from '../auth/auth';

export const user: RequestHandler = async (req: Request, res: Response, next: Function) => {
    let token = req.header('Authorization');
    let docID = decode(token!);
    let u = await db?.collection('users').doc(docID).get();

    if (u?.exists) {
        req.auth = u.data()!;
        req.authDocID = docID;
        return next();
    }

    return res.status(401).json({
        error: "Not Signed-in"
    })
}