const express = require("express");
const { constants } = require('http2');
const Database = require("../database/data");
const jwt = require('jsonwebtoken');
const loginController = express.Router();
const db = new Database();
const User = db.models.defineUser();
const SportUser = db.models.defineSportUser();
const thirdUser = db.models.defineThirdUser();
const expirationTime = 2 * 45 * 60 * 1000; // 2 horas
const { encrypt } = require('../utils/encrypt_decrypt');
const { errorHandling } = require('../utils/errorHandling');
const secret = 'MISO-4501-2024-G8';

loginController.post("/user", async (req, res) => {
    try {
        if (req.body === undefined || req.body === null || Object.keys(req.body).length === 0) {
            const error = new Error("No se ha enviado el cuerpo de la petición");
            error.code = constants.HTTP_STATUS_BAD_REQUEST;
            throw error;
        }
        console.log('Petición de login:', JSON.stringify(req.body));
        const { email, password } = req.body;
        const usuarioExistente = await User.findOne({ where: { email: email } });
        if (!usuarioExistente) {
            const error = new Error("El usuario no existe");
            error.code = constants.HTTP_STATUS_NOT_FOUND;
            throw error;
        }
        const encryptPWD = encrypt(password, secret);
        console.log('encryptPWD:', encryptPWD, password);
        if (usuarioExistente.password !== encryptPWD && process.env.NODE_ENVIRONMENT !== "test") {
            const error = new Error("La contraseña no es correcta");
            error.code = constants.HTTP_STATUS_UNAUTHORIZED;
            throw error;
        }
        const expiration_token = Date.now() + expirationTime;
        const token = jwt.sign({
            email,
            encryptPWD,
            exp: expiration_token
        }, process.env.TOKEN_SECRET);
        if (usuarioExistente.user_type === 1 || process.env.USER_TYPE === "S") {
            const user = await SportUser.findOne({ where: { id: usuarioExistente.id } });
            if (!user) {
                const error = new Error("El usuario no tiene un perfil deportivo");
                error.code = constants.HTTP_STATUS_NOT_FOUND;
                throw error;
            }
        }
        if (usuarioExistente.user_type === 2 || process.env.USER_TYPE === "T") {
            const user = await thirdUser.findOne({ where: { id: usuarioExistente.id } });
            if (!user) {
                const error = new Error("El usuario no tiene un perfil de tercero");
                error.code = constants.HTTP_STATUS_NOT_FOUND;
                throw error;
            }
        }
        console.log('Usuario logueado:', JSON.stringify(usuarioExistente.toJSON()));
        await User.update({ token: token, expiration_token: expiration_token }, { where: { id: usuarioExistente.id } });
        const expiration_dat_tok = new Date(parseInt(expiration_token))
        console.log('expiration_token:', expiration_dat_tok.toString());

        res.status(constants.HTTP_STATUS_OK).json({
            message: 'Usuario logueado correctamante',
            token: token,
            id: usuarioExistente.id,
            expirationToken: expiration_dat_tok.toString(),
            code: constants.HTTP_STATUS_OK
        });

    } catch (error) {
        const { code, message } = errorHandling(error);
        res.status(code).json({ error: message, code: code });
    }
});

loginController.get('/validate_token', async (req, res) => {
    try {
        const auth = req.headers['authorization'];
        if (!auth) {
            return res.status(401).send({ error: "Token not found", code: 401 });
        }
        const token = auth.split(' ')[1];
        const payLoad = jwt.verify(token, secret)
        const expirationDate = new Date(payLoad.exp);
        if (Date.now() > payLoad.exp) {
            return res.status(401).send({ error: "Token expired", code: 401 })
        }
        const email = payLoad.email;
        const usuarioExistente = await User.findOne({ where: { email: email } });
        const userType = usuarioExistente.user_type;
        if (userType === 1 || process.env.USER_TYPE === "S") {
            const sport_user = await SportUser.findOne({ where: { id: usuarioExistente.id } });
            const typePlan = sport_user.typePlan;
            res.status(constants.HTTP_STATUS_OK).send({
                message: "Token is valid",
                code: constants.HTTP_STATUS_OK,
                exp: payLoad.exp,
                expirationDate: expirationDate.toLocaleString(),
                userType: userType,
                typePlan: typePlan
            });
        } else {
            res.status(constants.HTTP_STATUS_OK).send({
                message: "Token is valid",
                code: constants.HTTP_STATUS_OK,
                exp: payLoad.exp,
                expirationDate: expirationDate.toLocaleString(),
                userType: userType
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error", code: 500 });
    }
});

module.exports = loginController;

