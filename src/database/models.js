// models.js

const { DataTypes } = require('sequelize');

class Models {
    constructor(sequelize) {
        this.sequelize = sequelize;
    }

    defineUser(){
        return this.sequelize.define('user', {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
                autoIncrement: true
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            doc_num: {
                type: DataTypes.STRING,
                allowNull: false
            },
            doc_type: {
                type: DataTypes.STRING(10),
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            phone: {
                type: DataTypes.STRING,
                allowNull: false
            },
            user_type: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            token: {
                type: DataTypes.STRING,
                allowNull: true
            },
            expiration_token: {
                type: DataTypes.DATE,
                allowNull: true
            }
        });
    }

    defineSportUser() {
        return this.sequelize.define('sport_user', {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
                autoIncrement: true
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

    defineThirdUser() {
        return this.sequelize.define('third_user', {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
                autoIncrement: true
            },
            company_creation_date: {
                type: DataTypes.DATE,
                allowNull: false
            },
            company_address: {
                type: DataTypes.STRING,
                allowNull: false
            },
            contact_name: {
                type: DataTypes.STRING,
                allowNull: false
            }
        });
    }
}

module.exports = Models;
