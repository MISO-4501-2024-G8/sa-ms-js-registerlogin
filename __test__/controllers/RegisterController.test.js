
jest.mock('../../src/database/data', () => {
    const SequelizeMock = require("sequelize-mock");
    const Models = require('../../src/database/models');
    class DatabaseMock {
        constructor() {
            this.sequelize = new SequelizeMock('database', 'username', 'password', {
                dialect: 'sqlite',
                storage: ':memory:',
            });
            this.models = new Models(this.sequelize);
        }
    
        async connect() {
            try {
                await this.sequelize.authenticate();
                console.log('Conexión a la base de datos establecida correctamente.');
            } catch (error) {
                console.error('Error al conectar a la base de datos:', error);
            }
        }
    
        async defineModel(modelName, fields) {
            return this.sequelize.define(modelName, fields);
        }
    
        async syncModels() {
            try {
                await this.sequelize.sync();
                console.log('Modelos sincronizados correctamente.');
            } catch (error) {
                console.error('Error al sincronizar modelos:', error);
            }
        }
    }

    return DatabaseMock;
});

const express = require("express");
const supertest = require("supertest");
const { constants } = require('http2');
const jwt = require('jsonwebtoken');
jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(() => "mocked-token")
}));
const Database = require("../../src/database/data");
const registerController = require("../../src/controllers/RegisterController");

describe("RegisterController", () => {
    let app;
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use("/register", registerController);
    });

    it("should create a new user", async () => {
        // Mock de datos de usuario
        const userData = {
            email: "example@example.com",
            psw: "password",
            name: "John Doe",
        };

        // Simula una solicitud POST a /user con los datos de usuario
        const response = await supertest(app)
            .post("/register/user")
            .send(userData);

        // Verifica que la respuesta tenga el código de estado correcto
        expect(response.status).toBe(constants.HTTP_STATUS_OK);

        // Verifica que la respuesta contenga el token JWT generado
        expect(response.body.token).toBe("mocked-token");
    });

    it("should handle errors", async () => {
        // Simula una solicitud POST a /user con datos de usuario inválidos
        const response = await supertest(app)
            .post("/register/user")
            .send(undefined);

        // Verifica que la respuesta tenga el código de estado de error correcto
        expect(response.status).toBe(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
    });
});
