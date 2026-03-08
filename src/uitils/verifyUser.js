import jwt from 'jsonwebtoken';
import { errorHandler } from './errorHandler.js';


export const verifyToken = (req, res, next) => {
    // let tokens = req.get('cookie').split("=")[1] //another way of parser the cookie in req

    // const token = req.cookies.access_token; // after installed npm package npm i cookie-parser
    const authHeader = req.headers.authorization;
    if (!authHeader) return next(errorHandler(401, 'Unauthorized'));
    const token = authHeader.split(" ")[1];

    if (!token) return next(errorHandler(401, 'Unauthorized'))

    let decode = jwt.decode(token)

    let currentTime = Math.round((+new Date()) / 1000)
    if (currentTime > decode.exp) return next(errorHandler(400, 'Session Expried login'))

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {

        // console.log(currentTime,decode.exp)
        if (err) return next(errorHandler(403, 'Forbidden'))
        req.user = user

        next()
    })
}

export const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return next(errorHandler(403, 'Access denied. Admins only.'));
    }
};
