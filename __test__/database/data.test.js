// Database.test.js
const Sequelize = require('sequelize');
const Models = require('../../src/database/models');
const Database = require('../../src/database/data');

jest.mock('sequelize', () => {
    const mSequelize = {
        define: jest.fn(),
        authenticate: jest.fn(),
        sync: jest.fn()
    };
    return {
        Sequelize: jest.fn(() => mSequelize)
    };
});

jest.mock('../../src/database/models', () => jest.fn());

describe('Database', () => {
    let database;

    beforeEach(() => {
        database = new Database();
    });

    it('should create a new Sequelize instance', () => {
        expect(Sequelize.Sequelize).toHaveBeenCalledWith(
            process.env.DB_DATABASE,
            process.env.DB_USER,
            process.env.DB_PASSWORD,
            {
                host: process.env.DB_HOST,
                dialect: process.env.DB_DIALECT || 'mysql'
            }
        );
    });

    it('should create a new Models instance', () => {
        expect(Models).toHaveBeenCalledWith(database.sequelize);
    });

    it('should connect to the database', async () => {
        await database.connect();
        expect(database.sequelize.authenticate).toHaveBeenCalled();
    });

    it('should define a model', () => {
        const modelName = 'Test';
        const fields = {};
        database.defineModel(modelName, fields);
        expect(database.sequelize.define).toHaveBeenCalledWith(modelName, fields);
    });

    it('should sync models', async () => {
        await database.syncModels();
        expect(database.sequelize.sync).toHaveBeenCalled();
    });
});