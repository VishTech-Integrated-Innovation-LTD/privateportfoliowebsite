"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
// Define the base model and cast after defining
const Collection = db_1.default.define("Collection", {
    sn: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        unique: true
    },
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    }
}, {
    timestamps: true,
});
// Extend the model with `associate`
// (Collection as typeof Collection & { associate?: (models: Models) => void }).associate = (models: Models) => {
//   Collection.hasMany(models.CollectionItem, {
//     onDelete: 'CASCADE',
//     onUpdate: 'CASCADE'
//   });
// Add belongsToMany association
//   Collection.belongsToMany(models.Archive, {
//     through: models.CollectionItem,
//     foreignKey: 'CollectionId',
//     otherKey: 'ArchiveId',
//     as: 'Archives'
//   });
// };
// (Collection as any).associate = (models: any) => {
// //   Collection.hasMany(models.CollectionItem, { foreignKey: 'CollectionId' });
//   Collection.belongsToMany(models.Archive, {
//     through: models.CollectionItem,
//     foreignKey: 'CollectionId',
//     otherKey: 'ArchiveId',
//     as: 'Archives'
//   });
// };
Collection.associate = (models) => {
    Collection.hasMany(models.CollectionItem, {
        foreignKey: 'CollectionId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
    Collection.belongsToMany(models.Archive, {
        through: models.CollectionItem,
        foreignKey: 'CollectionId',
        otherKey: 'ArchiveId',
        as: 'Archives'
    });
};
exports.default = Collection;
