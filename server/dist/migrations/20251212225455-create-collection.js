'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Collections', {
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
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            ArchiveId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'Archives', key: 'id' }
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
        await queryInterface.dropTable('Collections');
    }
};
