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
const loginController = require("../../src/controllers/LoginController");
const { v4: uuidv4 } = require('uuid');
const exp = require("constants");


describe("LoginController", () => {
    let app;
    const idUser = uuidv4().split('-')[0];
    const randomEmail = idUser + "@example.com";
    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use("/login", loginController);
    });

    it("should login a user", async () => {
        process.env.NODE_ENVIRONMENT = "test";
        const userData = {
            email: randomEmail,
            password: "password",
        };
        const response = await supertest(app)
            .post("/login/user")
            .send(userData);
        console.log('response:', response.body);
        expect(response.status).toBe(constants.HTTP_STATUS_OK);
        expect(response.body.token).toBe("mocked-token");
    });



    it("should generate error for user pwd not correct", async () => {
        process.env.NODE_ENVIRONMENT = "test1";
        const userData = {
            email: randomEmail,
            password: "password2",
        };
        const response = await supertest(app)
            .post("/login/user")
            .send(userData);
        expect(response.status).toBe(constants.HTTP_STATUS_UNAUTHORIZED);
    });

    it("should handle errors", async () => {
        // Simula una solicitud POST a /user con datos de usuario inválidos
        const response = await supertest(app)
            .post("/login/user")
            .send(undefined);

        // Verifica que la respuesta tenga el código de estado de error correcto
        expect(response.status).toBe(constants.HTTP_STATUS_BAD_REQUEST);
    });

    it("should handle any errors", async () => {
        try {
            jest.spyOn(console, 'log').mockImplementation(() => {
                throw new Error("Simulated error in console.log");
            });
            process.env.NODE_ENVIRONMENT = "test1";
            const userData = {
                email: randomEmail,
                password: "password",
            };
            const response = await supertest(app)
                .post('/login/user')
                .send(userData);
            console.log('response:', response.error);
            // Verifica que la respuesta tenga el código de estado de error correcto
            expect(response.status).toBe(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
        } catch (error) {
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe("Simulated error in console.log");
        }
    });
    
});