'use strict';
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.createTable('CollectionItems', {
      sn: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        unique: true
      },
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4, 
        primaryKey: true,
      },
      CollectionId: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: 'Collections', key: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
          },
        ArchiveId: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: 'Archives', key: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
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
    await queryInterface.dropTable('CollectionItems');
  }
};