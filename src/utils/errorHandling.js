const { constants } = require('http2');

function errorHandling(error) {
    let code;
    let message;
    if (error.code) {
        console.error(`Error ${error.code}: ${error.message}`);
        code = error.code;
        message = error.message;
    } else {
        console.error("Error al loguear el usuario:", error);
        const statusCode = error.code || constants.HTTP_STATUS_INTERNAL_SERVER_ERROR;
        code = statusCode;
        message = error.message;
    }
    return { code, message };
}

module.exports = { 
    errorHandling 
};