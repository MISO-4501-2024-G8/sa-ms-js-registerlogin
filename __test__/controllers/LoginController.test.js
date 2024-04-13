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
    sign: jest.fn(() => "mocked-token"),
    verify: jest.fn(() => ({ exp: Date.now() + 1000 }))
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

    it("should login a user sport_user", async () => {
        process.env.NODE_ENVIRONMENT = "test";
        process.env.USER_TYPE = "S";
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

    it("should login a user third_user", async () => {
        process.env.NODE_ENVIRONMENT = "test";
        process.env.USER_TYPE = "T";
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

    it('should return 401 if token not found', async () => {
        const res = await supertest(app)
            .get('/login/validate_token')
            .set('authorization', '');
    
        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual({ error: "Token not found", code: 401 });
    });
    
    it('should return 200 if token is valid', async () => {
    
        jwt.verify.mockReturnValue({ exp: Date.now() + 1000 });
    
        const res = await supertest(app)
            .get('/login/validate_token')
            .set('authorization', 'Bearer validToken');
    
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ message: "Token is valid", code: 200 });
    });

    it('should return 401 if token is expired', async () => {
        jwt.verify.mockReturnValue({ exp: Date.now() - 1000 });

        const res = await supertest(app)
            .get('/login/validate_token')
            .set('authorization', 'Bearer expiredToken');

        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual({ error: "Token expired", code: 401 });
    });

    it('should return 500 if jwt.verify throws an error', async () => {
        jwt.verify.mockImplementation(() => {
            throw new Error('Invalid token');
        });

        const res = await supertest(app)
            .get('/login/validate_token')
            .set('authorization', 'Bearer invalidToken');

        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({ message: "Internal server error", code: 500 });
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



/*

jest.mock('jsonwebtoken');

describe('GET /validate_token', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should return 401 if token is expired', async () => {
        jwt.verify.mockReturnValue({ exp: Date.now() - 1000 });

        const res = await request(app)
            .get('/validate_token')
            .set('authorization', 'Bearer expiredToken');

        expect(res.statusCode).toEqual(401);
        expect(res.body).toEqual({ error: "Token expired", code: 401 });
    });

    it('should return 200 if token is valid', async () => {
        jwt.verify.mockReturnValue({ exp: Date.now() + 1000 });

        const res = await request(app)
            .get('/validate_token')
            .set('authorization', 'Bearer validToken');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({ message: "Token is valid", code: 200 });
    });

    it('should return 500 if jwt.verify throws an error', async () => {
        jwt.verify.mockImplementation(() => {
            throw new Error('Invalid token');
        });

        const res = await request(app)
            .get('/validate_token')
            .set('authorization', 'Bearer invalidToken');

        expect(res.statusCode).toEqual(500);
        expect(res.body).toEqual({ message: "Internal server error", code: 500 });
    });
});

*/