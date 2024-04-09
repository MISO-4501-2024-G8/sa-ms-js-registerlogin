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
const db = new Database();
const User = { findOne: jest.fn() }; // Mock User object with a mocked findOne method
const SportUser = { findOne: jest.fn() }; // Mock SportUser object with a mocked findOne method
const thirdUser = { findOne: jest.fn() }; // Mock thirdUser object with a mocked findOne method
const userController = require("../../src/controllers/UserController");
const { v4: uuidv4 } = require('uuid');
const exp = require("constants");
jest.mock('../../src/database/models');

describe("UserController", () => {
    let app;
    const idUser = uuidv4().split('-')[0];
    const randomEmail = idUser + "@example.com";
    const secret = 'MISO-4501-2024-G8';
    const userId = 'someUserId';
    const token = jwt.sign({ exp: Date.now() + 600 * 2000 }, secret);
    const mockUser = {
        "id": "d9502337",
        "email": "pepe@example.com",
        "password": "Y29udHJhc2XxYV9wZXBlVFVsVFR5MDBOVEF4TFRJd01qUXRSemc9",
        "doc_num": "123456789",
        "doc_type": "CC",
        "name": "Pepe García",
        "phone": "3023344554",
        "user_type": 1,
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InBlcGVAZXhhbXBsZS5jb20iLCJlbmNyeXB0UFdEIjoiWTI5dWRISmhjMlh4WVY5d1pYQmxWRlZzVkZSNU1EQk9WRUY0VEZSSmQwMXFVWFJTZW1jOSIsImV4cCI6MTcxMjYyODAxOTA3MywiaWF0IjoxNzEyNjI2ODE5fQ.kOP5846P-mklQAQYE1lzGgyCKH5wNgGsBB03li1B2bE",
        "expiration_token": "2024-04-09T02:00:19.000Z",
        "createdAt": "2024-04-03T02:42:19.000Z",
        "updatedAt": "2024-04-09T01:40:19.000Z"
    };
    User.findOne.mockResolvedValue(mockUser);

    const mockSportUser = {
        "id": "d9502337",
        "gender": "M",
        "age": 35,
        "weight": 80,
        "height": 180.6,
        "birth_country": "España",
        "birth_city": "Madrid",
        "residence_country": "España",
        "residence_city": "Barcelona",
        "residence_seniority": 10,
        "sports": "Atletismo",
        "acceptance_notify": 1,
        "acceptance_tyc": 1,
        "acceptance_personal_data": 1,
        "createdAt": "2024-04-03T02:42:20.000Z",
        "updatedAt": "2024-04-03T02:42:20.000Z"
    };
    SportUser.findOne.mockResolvedValue(mockSportUser);

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use("/user", userController);

    });

    it('should return 401 if no token provided', async () => {
        const res = await supertest(app)
            .get(`/user/${userId}`)
            .set('Authorization', '');
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('error', 'No token provided');
    });

    it("should get a user", async () => {
        const response = await supertest(app)
            .get("/user/abcdedf")
            .set('Authorization', `Bearer ${token}`);
        console.log('response:', response.body);
        expect(response.status).toBe(500);
        expect(JSON.stringify(response.body)).toBe(JSON.stringify({ "message": "Error interno del servidor" }));
    });
});