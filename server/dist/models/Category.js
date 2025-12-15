"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
// Define the base model and cast after defining
const Category = db_1.default.define("Category", {
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
    },
}, {
    timestamps: true,
});
// Extend the model with `associate`
Category.associate = (models) => {
    Category.hasMany(models.Archive);
    Category.hasMany(models.Draft);
};
exports.default = Category;
