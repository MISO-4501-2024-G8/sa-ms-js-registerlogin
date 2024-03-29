
const Database = require("../../src/database/data");
const SequelizeMock = require("sequelize-mock");
const dbMock = new SequelizeMock();

class DatabaseMock {
    constructor() {
        // Puedes inicializar propiedades necesarias aquí si las hay
        this.sequelize = new SequelizeMock();
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

jest.mock('../../src/database/data', () => {
    return () => {
        return new DatabaseMock();
    };
});




