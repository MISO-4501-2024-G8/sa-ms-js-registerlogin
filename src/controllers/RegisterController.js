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

function checkRequestBody(req) {
    if (req.body === undefined || req.body === null || Object.keys(req.body).length === 0) {
        const error = new Error("No se ha enviado el cuerpo de la petición");
        error.code = constants.HTTP_STATUS_BAD_REQUEST;
        throw error;
    }
}

const checkUsuarioExistente = async (email) => {
    const usuarioExistente = await User.findOne({ where: { email: email } });
    if (usuarioExistente && usuarioExistente.email === email && process.env.NODE_ENVIRONMENT !== "test") {
        const error = new Error("El usuario ya existe");
        error.code = constants.HTTP_STATUS_CONFLICT;
        throw error;
    }
}

const resultUser = (expiration_token, token, idUser) => {
    const expiration_dat_token = new Date(parseInt(expiration_token))
    console.log('expiration_token:', expiration_dat_token.toString());
    const rslt = {
        message: 'Usuario insertado correctamante',
        token: token,
        id: idUser,
        expirationToken: expiration_dat_token.toString(),
        code: constants.HTTP_STATUS_OK
    };
    return rslt;
};

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

    return { idUser, expiration_token, token, nuevoUsuario };
}

const registerUser = async (req, type) => {
    checkRequestBody(req);
    console.log('Petición de creación de usuario:', JSON.stringify(req.body));
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
    switch (user_type) {
        case 'S':
            userType = 1;
            break;
        case 'T':
            userType = 2;
            break;
        case 'A':
            userType = 3;
            break;
    }
    const { idUser, expiration_token, token, nuevoUsuario } = await crearUsuario(email, password, doc_num, doc_type, name, phone, userType);
    console.log('Nuevo usuario creado:', JSON.stringify(nuevoUsuario.toJSON()));
    if (type === 'sport_user') {
        const {
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
            typePlan,
            acceptance_notify,
            acceptance_tyc,
            acceptance_personal_data
        } = req.body;

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
            typePlan: typePlan ?? 'basico',
            acceptance_notify,
            acceptance_tyc,
            acceptance_personal_data
        });
        console.log('Nuevo usuario sport creado:', JSON.stringify(nuevoUsuarioSport.toJSON()));
        return resultUser(expiration_token, token, idUser);
    }
    else if (type === 'third_user') {
        const {
            company_creation_date,
            company_address,
            contact_name,
            company_description,
        } = req.body;
        const nuevoUsuarioThird = await thirdUser.create({
            id: idUser,
            company_creation_date,
            company_address,
            contact_name,
            company_description: company_description ?? '',
            company_status: 1
        });
        console.log('Nuevo usuario tercero creado:', JSON.stringify(nuevoUsuarioThird.toJSON()));
        return resultUser(expiration_token, token, idUser);
    }
    else if (type === 'admin_user') {
        return resultUser(expiration_token, token, idUser);
    }
}

async function handleUserRegistration(req, res, userType) {
    try {
        const rslt = await registerUser(req, userType);
        res.status(constants.HTTP_STATUS_OK).json(rslt);
    } catch (error) {
        console.error(`${userType} error:`, error);
        const { code, message } = errorHandling(error);
        res.status(code).json({ error: message, code: code });
    }
}

registerController.post("/sport_user", async (req, res) => {
    handleUserRegistration(req, res, 'sport_user');
});

registerController.post("/third_user", async (req, res) => {
    handleUserRegistration(req, res, 'third_user');
});

registerController.post("/admin_user", async (req, res) => {
    handleUserRegistration(req, res, 'admin_user');
});

registerController.put("/typePlanUser/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (id === undefined || id === null || id === "") {
            const error = new Error("No se ha enviado el id del usuario");
            error.code = constants.HTTP_STATUS_BAD_REQUEST;
            throw error;
        }
        const { typePlan } = req.body;
        if (typePlan === undefined || typePlan === null || typePlan === "") {
            const error = new Error("No se ha enviado el tipo de plan");
            error.code = constants.HTTP_STATUS_BAD_REQUEST;
            throw error;
        }
        const user = await User.findOne({ where: { id: id } });
        if (!user) {
            const error = new Error("El usuario no existe");
            error.code = constants.HTTP_STATUS_NOT_FOUND;
            throw error;
        }
        if(process.env.USER_TYPE === "S"){
            user.user_type = 1;
        }
        if(user.user_type !== 1){
            const error = new Error("El usuario no es de tipo deportivo");
            error.code = constants.HTTP_STATUS_BAD_REQUEST;
            throw error;
        }
        SportUser.update({ typePlan: typePlan }, { where: { id: id } })
            .then(() => {
                res.status(constants.HTTP_STATUS_OK).json({ message: 'Plan actualizado correctamente', plan: typePlan, code: constants.HTTP_STATUS_OK });
            })
            .catch((error) => {
                const { code, message } = errorHandling(error);
                res.status(code).json({ error: message, code: code });
            });
    } catch (error) {
        console.error(error);
        const { code, message } = errorHandling(error);
        res.status(code).json({ message: message, code: code });
    }
});


module.exports = registerController;