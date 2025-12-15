'use strict';
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable('Drafts', {
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
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      CategoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'Categories', key: 'id' }
      },
      mediaType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      visibility: {
        type: Sequelize.ENUM('public', 'private'),
        allowNull: false,
        defaultValue: 'public',
      },
      cloudServiceUrl: {
        type: Sequelize.TEXT,
        allowNull: false,
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

  async down(queryInterface: QueryInterface, Sequelize: any) {
    await queryInterface.dropTable('Drafts');
  }
};