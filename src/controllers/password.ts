import db from '../../config/firestore';
import { Request, Response, RequestHandler } from 'express';
import CryptoJS from 'crypto-js';


type PasswordRecord = {
    platform: string;
    password: string;
    user: string;
    account: string;
}

type out = {
    error?: string;
    account?: string;
    password?: string;
    platform?: string;
}

type UnlockPass = {
    key: string
    docID: string
}

// export const test: RequestHandler = async (req: Request, res: Response, next: Function) => {
//     // let u: FirebaseFirestore.QuerySnapshot | undefined = await db?.collection('users').doc(req.params.email)?.collection('passwords').get()
//     // let user = await db?.collection('users').where('id', '==', '1ae8505f-ba32-4f22-aa8f-bdf0e1a83279').get()
//     // console.log(user)

//     let s = await db?.collection('users').doc()
//     console.log(s?.id)
//     console.log(await s?.create({ name: "Shobhit" }))


//     // // console.log(u.)
//     // if (u && !u.empty) {
//     //     // console.log(u.docs)
//     //     u.forEach((d: FirebaseFirestore.DocumentSnapshot) => {
//     //         if (d.exists) {
//     //             console.log(d.data());
//     //         }
//     //     })
//     // }
//     // // console.log(u?.data());

//     res.send("hello");

// }

export const myPasswords: RequestHandler = async (req: Request, res: Response, next: Function) => {
    let authDocID = req.authDocID
    let data: FirebaseFirestore.QuerySnapshot | undefined = await db?.collection('passwords').where('user', '==', authDocID).get()

    let passwords: Record<string, Object[]> = {}

    if (data && !data.empty) {
        data.forEach((snap: FirebaseFirestore.DocumentSnapshot) => {
            let data = snap.data();

            if (!passwords[data?.platform]) {
                passwords[data?.platform] = []
            }
            let rem = {
                ...data,
            }
            rem.docID = snap.id
            delete rem.platform
            delete rem.password
            delete rem.user
            passwords[data?.platform]?.push(rem)
        })
    }

    res.status(200).json(passwords)
}

export const addPasswords: RequestHandler = async (req: Request, res: Response, next: Function) => {
    let authDocID = req.authDocID
    let docRef = db?.collection('passwords').doc()
    const _b = req.body

    let pwrd = _b.password
    let key = _b.key
    let encrypted: string = CryptoJS.AES.encrypt(pwrd, key).toString()
    // console.log(encrypted)

    let record: PasswordRecord = {
        platform: _b.platform,
        password: encrypted,
        user: authDocID,
        account: _b.account,
    }

    await docRef?.set(record)

    res.status(201).send();
}

export const unlock: RequestHandler = async (req: Request, res: Response, next: Function) => {
    let authDocID = req.authDocID
    let _b: UnlockPass = req.body

    let doc = await db?.collection('passwords').doc(_b.docID).get();

    let statusCode: number = 200
    let out: out = {}

    if (doc?.exists) {
        let data = doc.data();

        if (data?.user !== authDocID) {
            statusCode = 401
            out.error = "Invalid access!"
        } else {
            statusCode = 200
            out.account = data.account
            let decrypted: string = CryptoJS.AES.decrypt(data.password, _b.key).toString(CryptoJS.enc.Utf8)
            out.password = decrypted
            out.platform = data.platform
        }
    } else {
        statusCode = 404
        out.error = "Record not found"
    }

    res.status(statusCode).json(out)
}