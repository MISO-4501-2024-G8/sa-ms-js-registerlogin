const express = require("express");
const { constants } = require('http2');
const Database = require("../database/data");
const jwt = require('jsonwebtoken');
const userController = express.Router();
const db = new Database();
const User = db.models.defineUser();
const SportUser = db.models.defineSportUser();
const thirdUser = db.models.defineThirdUser();
const expirationTime = 600 * 2000;
const { encrypt } = require('../utils/encrypt_decrypt');
const { errorHandling } = require('../utils/errorHandling');
const secret = 'MISO-4501-2024-G8';

userController.get("/:id", async (req, res) => {
    try {
        const auth = req.headers.authorization;
        if (!auth) {
            return res.status(401).send({ error: "No token provided" })
        }
        const token = auth.split(' ')[1];
        const payLoad = jwt.verify(token, secret)
        if (Date.now() > payLoad.exp) {
            return res.status(401).send({ error: "Token expired" })
        }
        const { id } = req.params;
        if (id === undefined || id === null || id === "") {
            const error = new Error("No se ha enviado el id del usuario");
            error.code = constants.HTTP_STATUS_BAD_REQUEST;
            throw error;
        }
        User.findOne({ where: { id: id } })
            .then(async (user) => {
                if (!user) {
                    const error = new Error("El usuario no existe");
                    error.code = constants.HTTP_STATUS_NOT_FOUND;
                    throw error;
                }
                // Revisar si el token es valido para la consulta
                if (token === user.token || process.env.NODE_ENVIRONMENT === "test") {
                    if (user.user_type === 1 || process.env.USER_TYPE === "S") {
                        const sportUserBase = await SportUser.findOne({ where: { id: id } })
                            .then((sportUser) => {
                                return sportUser;
                            })
                            .catch((error) => {
                                const { code, message } = errorHandling(error);
                                res.status(code).json({ error: message });
                            });
                        user.sportUser = sportUserBase;
                        console.log('sportUserBase:', JSON.stringify(sportUserBase.toJSON()));
                        const userBase = { ...user.toJSON(), detail: sportUserBase.toJSON() };
                        res.status(constants.HTTP_STATUS_OK).send(userBase);
                    } else if (user.user_type === 2 || process.env.USER_TYPE === "T") {
                        const thirdUserBase = await thirdUser.findOne({ where: { id: id } })
                            .then((thirdUser) => {
                                return thirdUser;
                            })
                            .catch((error) => {
                                const { code, message } = errorHandling(error);
                                res.status(code).json({ error: message });
                            });
                        console.log('thirdUserBase:', JSON.stringify(thirdUserBase.toJSON()));
                        const userBase = { ...user.toJSON(), detail: thirdUserBase.toJSON() };
                        res.status(constants.HTTP_STATUS_OK).send(userBase);
                    } else {
                        res.status(constants.HTTP_STATUS_OK).send(user);
                    }
                }
                else {
                    res.status(401).send({ error: "Token invalido para consulta" })
                }
            })
            .catch((error) => {
                const { code, message } = errorHandling(error);
                res.status(code).json({ error: message });
            });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = userController;