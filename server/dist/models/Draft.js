"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
const Category_1 = __importDefault(require("./Category"));
// Define the base model and cast after defining
const Draft = db_1.default.define("Draft", {
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
        defaultValue: 'private',
    },
    cloudServiceUrl: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    }
}, {
    timestamps: true,
});
Draft.belongsTo(Category_1.default);
exports.default = Draft;
