const express = require("express");
const { constants } = require('http2');
const Database = require("../database/data");
const jwt = require('jsonwebtoken');
const registerController = express.Router();
const db = new Database();
const User = db.models.defineUser();
const expirationTIme = 600 * 1000;

registerController.post("/user", async (req, res) => {
    try {
        console.log('Petición de creación de usuario:', req.body);
        if (req.body === undefined || req.body === null || Object.keys(req.body).length === 0){
            throw new Error("No se ha enviado el cuerpo de la petición");
        }
        const { 
            email, 
            psw, 
            name, 
            doc_type,
            document,
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

        const nuevoUsuario = await User.create({
            email,
            psw,
            name,
            doc_type,
            document,
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

        console.log('Nuevo usuario creado:', nuevoUsuario.toJSON());
        const token = jwt.sign({
            email,
            psw,
            exp: Date.now() + expirationTIme
        }, process.env.TOKEN_SECRET)
        res.status(constants.HTTP_STATUS_OK).json({ message: 'Usuario insertado correctamante', token: token});
    } catch (error) {
        console.error("Error al crear el usuario:", error);
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ error: "Error al crear el usuario" });
    }
});

module.exports = registerController;