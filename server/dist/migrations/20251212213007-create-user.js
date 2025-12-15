'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Users', {
            sn: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                unique: true
            },
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4, // Or DataTypes.UUIDV1
                primaryKey: true,
            },
            userName: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            userType: {
                type: Sequelize.ENUM('admin'),
                allowNull: false,
                defaultValue: 'admin',
            },
            createdAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },
            updatedAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Users');
    }
};
