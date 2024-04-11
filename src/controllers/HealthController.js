const express = require("express");
const { constants } = require('http2');

const healthController = express.Router();

healthController.get("/status", (req, res) => {
    res.status(constants.HTTP_STATUS_OK).json({ status: "OK", code: 200 });
});

module.exports = healthController;