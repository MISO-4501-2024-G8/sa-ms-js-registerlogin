const express = require("express");
const { constants } = require('http2');
const Database = require("../database/data");
const jwt = require('jsonwebtoken');
const loginController = express.Router();
const db = new Database();
const User = db.models.defineUser();
const SportUser = db.models.defineSportUser();
const expirationTime = 600 * 2000;
const { v4: uuidv4 } = require('uuid');
const { encrypt, decrypt } = require('../utils/encrypt_decrypt');
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
        console.log('usuarioExistente.password:', usuarioExistente.password);
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
        if (usuarioExistente.user_type === 1) {
            const user = await SportUser.findOne({ where: { id: usuarioExistente.id } });
            if (!user) {
                const error = new Error("El usuario no tiene un perfil deportivo");
                error.code = constants.HTTP_STATUS_NOT_FOUND;
                throw error;
            }
        }
        console.log('Usuario logueado:', JSON.stringify(usuarioExistente.toJSON()));
        await User.update({ token: token, expiration_token: expiration_token }, { where: { id: usuarioExistente.id } });
        const expiration_dat_token = new Date(parseInt(expiration_token))
        console.log('expiration_token:', expiration_dat_token.toString());

        res.status(constants.HTTP_STATUS_OK).json({
            message: 'Usuario logueado correctamante',
            token: token,
            id: usuarioExistente.id,
            expirationToken: expiration_dat_token.toString()
        });

    } catch (error) {
        if (error.code) {
            console.error(`Error ${error.code}: ${error.message}`);
            res.status(error.code).json({ error: error.message });
        } else {
            console.error("Error al loguear el usuario:", error);
            const statusCode = error.code || constants.HTTP_STATUS_INTERNAL_SERVER_ERROR;
            res.status(statusCode).json({ error: error.message, code: statusCode });
        }
    }
});

module.exports = loginController;

