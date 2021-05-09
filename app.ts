import express, { Request, Response, Application } from 'express';
import User from './src/routers/user';
import Password from './src/routers/password';

declare global {
    namespace Express {
        interface Request {
            auth: Object,
            authDocID: string
        }
    }
}
const app: Application = express();

app.use(express.json())
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        "working": true
    })
})

app.use('/user', User);
app.use('/password', Password);

app.listen(3000, () => {
    console.log("App is running")
})
