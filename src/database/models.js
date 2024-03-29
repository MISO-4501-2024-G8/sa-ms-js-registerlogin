// models.js

const { DataTypes } = require('sequelize');

class Models {
    constructor(sequelize) {
        this.sequelize = sequelize;
    }

    defineUser() {
        return this.sequelize.define('user', {
            email: {
                type: DataTypes.STRING,
                allowNull: false
            },
            psw: {
                type: DataTypes.STRING,
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            doc_type: {
                type: DataTypes.STRING(10),
                allowNull: false
            },
            document: {
                type: DataTypes.STRING,
                allowNull: false
            },
            gender: {
                type: DataTypes.STRING(5),
                allowNull: false
            },
            age: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            weight: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            height: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            birth_country: {
                type: DataTypes.STRING,
                allowNull: false
            },
            birth_city: {
                type: DataTypes.STRING,
                allowNull: false
            },
            residence_country: {
                type: DataTypes.STRING,
                allowNull: false
            },
            residence_city: {
                type: DataTypes.STRING,
                allowNull: false
            },
            residence_seniority: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            sports: {
                type: DataTypes.STRING,
                allowNull: false
            },
            acceptance_notify: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            acceptance_tyc: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            acceptance_personal_data: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        });
    }
}

module.exports = Models;
