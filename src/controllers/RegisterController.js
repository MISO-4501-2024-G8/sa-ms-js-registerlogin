const express = require("express");
const { constants } = require('http2');
const Database = require("../database/data");

const registerController = express.Router();
const db = new Database();
const User = db.models.defineUser();

registerController.post("/user", async (req, res) => {
    try {
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

        res.status(constants.HTTP_STATUS_OK).json({ status: "OK" });
    } catch (error) {
        console.error("Error al crear el usuario:", error);
        res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ error: "Error al crear el usuario" });
    }
});

module.exports = registerController;