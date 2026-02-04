"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
const Category_1 = __importDefault(require("./Category"));
// Define the base model and cast after defining
const Archive = db_1.default.define("Archive", {
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
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    CategoryId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'Categories', key: 'id' }
    },
    mediaType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    visibility: {
        type: sequelize_1.DataTypes.ENUM('public', 'private'),
        allowNull: false,
        defaultValue: 'public',
    },
    isOnTheMainPage: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    cloudServiceUrl: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    }
}, {
    timestamps: true,
});
// Extend the model with `associate`
// (Archive as typeof Archive & { associate?: (models: Models) => void }).associate = (models: Models) => {
//   Archive.hasMany(models.CollectionItem, {
//     onDelete: 'CASCADE',
//     onUpdate: 'CASCADE'
//   });
// After defining the Archive model
// Archive.belongsToMany(Collection, {
//   through: CollectionItem,
//   foreignKey: 'ArchiveId',
//   otherKey: 'CollectionId',
//   as: 'Collections' // Important: matches the alias in query
// });
// };
// (Archive as any).associate = (models: any) => {
//   Archive.hasMany(models.CollectionItem, { foreignKey: 'ArchiveId' });
//   Archive.belongsToMany(models.Collection, {
//     through: models.CollectionItem,
//     foreignKey: 'ArchiveId',
//     otherKey: 'CollectionId',
//     as: 'Collections'
//   });
// //   Archive.belongsTo(models.Category);
// };
Archive.associate = (models) => {
    Archive.hasMany(models.CollectionItem, {
        foreignKey: 'ArchiveId',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    });
    Archive.belongsToMany(models.Collection, {
        through: models.CollectionItem,
        foreignKey: 'ArchiveId',
        otherKey: 'CollectionId',
        as: 'Collections'
    });
    Archive.belongsTo(models.Category);
};
Archive.belongsTo(Category_1.default);
exports.default = Archive;
