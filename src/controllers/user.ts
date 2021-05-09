import db from '../../config/firestore';
import speakeasy from 'speakeasy';
import { v4 as uuidv4 } from 'uuid';
import * as auth from '../auth/auth';
import QRcode from 'qrcode';
import { Request, Response, RequestHandler } from 'express'

interface responseToSend {
    token?: string,
    url?: string,
    code?: string,
    verified: boolean,
    error?: string,
}


export const login: RequestHandler = async (req: Request, res: Response, next: Function) => {
    let email = req.params.email
    let token = req.query.token?.toString()
    let pastUser: FirebaseFirestore.QuerySnapshot | undefined = await db?.collection('users').where('email', '==', email).get();

    let statusCode: number;
    let out: responseToSend = {
        verified: false,
    }

    if (!pastUser?.empty) {

        let u: FirebaseFirestore.DocumentData | undefined;
        let id: string | null = null
        pastUser?.forEach((snapshot: FirebaseFirestore.QueryDocumentSnapshot) => {
            u = snapshot.data()
            id = snapshot.id;
        })

        if (!token) {
            out.error = 'Token not provided'
            statusCode = 400;
        } else if (!u?.verified) {
            statusCode = 203
            out.error = "Secret not verified yet"
        } else {

            let verified = speakeasy.totp.verify({
                secret: u?.secret,
                encoding: 'base32',
                token: token!
            })

            out.verified = verified
            if (verified) {
                if (id === null) {
                    out.error = "ID not found"
                    statusCode = 404
                } else {
                    out.token = auth.encode(id!)
                    statusCode = 200;
                }
            } else {
                statusCode = 400;
                out.error = "Invalid token";
            }
        }

    } else {
        // generate secret for registeration on TOTP app.
        const secret: speakeasy.GeneratedSecret = speakeasy.generateSecret()
        console.log(secret);

        let userRef = db?.collection('users').doc()

        await userRef?.set({
            secret: secret.base32,
            verified: false,
            email: email
        })

        // The secret is made and the QR is made for the totp url
        let url = await QRcode.toDataURL(secret.otpauth_url!)
        let imgurl: string = url;
        // console.log(imgurl)
        out.url = imgurl
        out.code = secret.base32;
        statusCode = 201;

    }

    res.status(statusCode).json({
        ...out
    })
}


export const totpverify: RequestHandler = async (req: Request, res: Response, next: Function) => {
    let email = req.params.email
    let token: string = req.body.token?.toString()

    let pastUser: FirebaseFirestore.QuerySnapshot | undefined = await db?.collection('users').where('email', '==', email).get();

    if (pastUser?.empty) {
        return res.status(400).json({
            error: "User not found!"
        })
    } else {
        let u: FirebaseFirestore.DocumentData | undefined;
        let id: string | null = null
        pastUser?.forEach((snapshot: FirebaseFirestore.QueryDocumentSnapshot) => {
            u = snapshot.data();
            id = snapshot.id
        })

        if (u && id) {
            let verified = speakeasy.totp.verify({
                secret: u.secret,
                encoding: 'base32',
                token: token
            })

            if (verified) {
                await db?.collection('users').doc(id).update({ verified: true })

                return res.status(200).json({
                    token: auth.encode(id),
                })
            } else {
                return res.status(400).json({
                    error: "Invalid token"
                })
            }
        } else {
            return res.status(404).json({
                error: "User not found"
            })
        }
    }
}


