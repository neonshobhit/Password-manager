import jwt from 'jsonwebtoken';
import secret from '../secrets/secret';

export const encode = (id: string) => {
    let token = jwt.sign({ id: id }, secret.jwt.secret)

    return token;
}

export const decode = (token: string): string => {
    let id = {
        id: ""
    }
    token = token.split(' ')[1]
    Object.assign(id, jwt.verify(token, secret.jwt.secret));

    return id?.id;
}