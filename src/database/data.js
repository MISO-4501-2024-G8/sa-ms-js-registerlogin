// database.js

const { Sequelize } = require('sequelize');
const Models = require('./models');

class Database {
    constructor() {
        const DBData = {
            database: process.env.DB_DATABASE,
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST
        }
        console.log('DBData:', DBData);
        this.sequelize = new Sequelize(DBData.database, DBData.username, DBData.password, {
            host: DBData.host,
            dialect: 'mysql'
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

    defineModel(modelName, fields) {
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

module.exports = Database;
