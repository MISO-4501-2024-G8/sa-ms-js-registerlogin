const express = require("express");
const { constants } = require('http2');
const Database = require("../database/data");
const jwt = require('jsonwebtoken');
const registerController = express.Router();
const db = new Database();
const User = db.models.defineUser();
const SportUser = db.models.defineSportUser();
const thirdUser = db.models.defineThirdUser();
const expirationTime = 30 * 60 * 1000; // 30 minutes
const { v4: uuidv4 } = require('uuid');
const { encrypt, decrypt } = require('../utils/encrypt_decrypt');
const { errorHandling } = require('../utils/errorHandling');
const secret = 'MISO-4501-2024-G8';

const checkUsuarioExistente = async (email) => {
    const usuarioExistente = await User.findOne({ where: { email: email } });
    if (usuarioExistente && usuarioExistente.email === email && process.env.NODE_ENVIRONMENT !== "test") {
        const error = new Error("El usuario ya existe");
        error.code = constants.HTTP_STATUS_CONFLICT;
        throw error;
    }
}

const crearUsuario = async (email, password, doc_num, doc_type, name, phone, user_type) => {
    const encryptPWD = encrypt(password, secret);
    const idUser = uuidv4().split('-')[0];
    const expiration_token = Date.now() + expirationTime;
    const token = jwt.sign({
        email,
        encryptPWD,
        exp: expiration_token
    }, process.env.TOKEN_SECRET)

    const nuevoUsuario = await User.create({
        id: idUser,
        email,
        password: encryptPWD,
        doc_num,
        doc_type,
        name,
        phone,
        user_type,
        token,
        expiration_token
    });

    console.log('Nuevo usuario creado:', JSON.stringify(nuevoUsuario.toJSON()));
    return { idUser, expiration_token, token, nuevoUsuario };
}


registerController.post("/sport_user", async (req, res) => {
    try {

        if (req.body === undefined || req.body === null || Object.keys(req.body).length === 0) {
            const error = new Error("No se ha enviado el cuerpo de la petición");
            error.code = constants.HTTP_STATUS_BAD_REQUEST;
            throw error;
        }
        console.log('Petición de creación de usuario:', JSON.stringify(req.body));
        const {
            email,
            password,
            doc_num,
            doc_type,
            name,
            phone,
            user_type,
            gender,
            age,
            weight,
            height,
            birth_country,
            birth_city,
            residence_country,
            residence_city,
            residence_seniority,
            sports,
            acceptance_notify,
            acceptance_tyc,
            acceptance_personal_data } = req.body;

        await checkUsuarioExistente(email);

        let userType = 0;
        // A: Administrator, S: Sport User, T: Third Party User
        if (user_type === 'S') {
            userType = 1;
        }

        /*
        const encryptPWD = encrypt(password, secret);
        const idUser = uuidv4().split('-')[0];
        const expiration_token = Date.now() + expirationTime;
        const token = jwt.sign({
            email,
            encryptPWD,
            exp: expiration_token
        }, process.env.TOKEN_SECRET)

        const nuevoUsuario = await User.create({
            id: idUser,
            email,
            password: encryptPWD,
            doc_num,
            doc_type,
            name,
            phone,
            user_type: userType,
            token,
            expiration_token
        });
        */

        const { idUser, expiration_token, token, nuevoUsuario } = await crearUsuario(email, password, doc_num, doc_type, name, phone, userType);

        console.log('Nuevo usuario creado:', JSON.stringify(nuevoUsuario.toJSON()));

        const nuevoUsuarioSport = await SportUser.create({
            id: idUser,
            gender,
            age,
            weight,
            height,
            birth_country,
            birth_city,
            residence_country,
            residence_city,
            residence_seniority,
            sports,
            acceptance_notify,
            acceptance_tyc,
            acceptance_personal_data
        });

        console.log('Nuevo usuario creado:', JSON.stringify(nuevoUsuarioSport.toJSON()));
        const expiration_dat_token = new Date(parseInt(expiration_token))
        console.log('expiration_token:', expiration_dat_token.toString());
        res.status(constants.HTTP_STATUS_OK).json({
            message: 'Usuario insertado correctamante',
            token: token,
            id: idUser,
            expirationToken: expiration_dat_token.toString(),
            code: constants.HTTP_STATUS_OK
        });
    } catch (error) {
        const { code, message } = errorHandling(error);
        res.status(code).json({ error: message, code: code });
    }
});

registerController.post("/third_user", async (req, res) => {
    try {
        if (req.body === undefined || req.body === null || Object.keys(req.body).length === 0) {
            const error = new Error("No se ha enviado el cuerpo de la petición");
            error.code = constants.HTTP_STATUS_BAD_REQUEST;
            throw error;
        }
        console.log('Petición de creación de usuario tercero:', JSON.stringify(req.body));
        const {
            email,
            password,
            doc_num,
            doc_type,
            name,
            phone,
            user_type,
            company_creation_date,
            company_address,
            contact_name } = req.body;

        await checkUsuarioExistente(email);

        let userType = 0;
        // A: Administrator, S: Sport User, T: Third Party User
        if (user_type === 'T') {
            userType = 2;
        }
        /*
        const encryptPWD = encrypt(password, secret);
        console.log('Contraseña encriptada:', encryptPWD);
        const idUser = uuidv4().split('-')[0];
        const expiration_token = Date.now() + expirationTime;
        const token = jwt.sign({
            email,
            encryptPWD,
            exp: expiration_token
        }, process.env.TOKEN_SECRET)

        const nuevoUsuario = await User.create({
            id: idUser,
            email,
            password: encryptPWD,
            doc_num,
            doc_type,
            name,
            phone,
            user_type: userType,
            token,
            expiration_token
        });
*/
        const { idUser, expiration_token, token, nuevoUsuario } = await crearUsuario(email, password, doc_num, doc_type, name, phone, userType);
        console.log('Nuevo usuario creado:', JSON.stringify(nuevoUsuario.toJSON()));

        const nuevoUsuarioThird = await thirdUser.create({
            id: idUser,
            company_creation_date,
            company_address,
            contact_name
        });

        console.log('Nuevo usuario creado:', JSON.stringify(nuevoUsuarioThird.toJSON()));
        const expiration_dat_token = new Date(parseInt(expiration_token))
        console.log('expiration_token:', expiration_dat_token.toString());
        res.status(constants.HTTP_STATUS_OK).json({
            message: 'Usuario insertado correctamante',
            token: token,
            id: idUser,
            expirationToken: expiration_dat_token.toString(),
            code: constants.HTTP_STATUS_OK
        });
    } catch (error) {
        const { code, message } = errorHandling(error);
        res.status(code).json({ error: message, code: code });
    }
});

registerController.post("/admin_user", async (req, res) => {
    try {
        if (req.body === undefined || req.body === null || Object.keys(req.body).length === 0) {
            const error = new Error("No se ha enviado el cuerpo de la petición");
            error.code = constants.HTTP_STATUS_BAD_REQUEST;
            throw error;
        }
        console.log('Petición de creación de usuario administrador:', JSON.stringify(req.body));
        const {
            email,
            password,
            doc_num,
            doc_type,
            name,
            phone,
            user_type } = req.body;

        await checkUsuarioExistente(email);

        let userType = 0;
        // A: Administrator, S: Sport User, T: Third Party User
        if (user_type === 'A') {
            userType = 3;
        }

        /*
        const encryptPWD = encrypt(password, secret);
        console.log('Contraseña encriptada:', encryptPWD);
        const idUser = uuidv4().split('-')[0];
        const expiration_token = Date.now() + expirationTime;
        const token = jwt.sign({
            email,
            encryptPWD,
            exp: expiration_token
        }, process.env.TOKEN_SECRET)

        const nuevoUsuario = await User.create({
            id: idUser,
            email,
            password: encryptPWD,
            doc_num,
            doc_type,
            name,
            phone,
            user_type: userType,
            token,
            expiration_token
        });
        */

        const { idUser, expiration_token, token, nuevoUsuario } = await crearUsuario(email, password, doc_num, doc_type, name, phone, userType);

        console.log('Nuevo usuario creado:', JSON.stringify(nuevoUsuario.toJSON()));
        const expiration_dat_token = new Date(parseInt(expiration_token))
        console.log('expiration_token:', expiration_dat_token.toString());
        res.status(constants.HTTP_STATUS_OK).json({
            message: 'Usuario insertado correctamante',
            token: token,
            id: idUser,
            expirationToken: expiration_dat_token.toString(),
            code: constants.HTTP_STATUS_OK
        });
    } catch (error) {
        const { code, message } = errorHandling(error);
        res.status(code).json({ error: message, code: code });
    }
});


module.exports = registerController;