"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing necessary Sequelize dependencies: DataTypes for defining column types,
// Model for creating the model class
const sequelize_1 = require("sequelize");
// Importing the configured Sequelize instance for database connection.
const db_1 = __importDefault(require("../db"));
// Defining the User model using sequelize.define, specifying the model name, attributes, and options.
// The generic type UserInstance ensures type safety for the model's instances.
const User = db_1.default.define('User', {
    // Defining the model's attributes (columns) with their data types.
    sn: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        unique: true
    },
    id: {
        type: sequelize_1.DataTypes.UUID, // UUID type for unique identifier.
        defaultValue: sequelize_1.DataTypes.UUIDV4, // Automatically generates a UUID v4 for new records.
        primaryKey: true, // Marks this field as the primary key.
    },
    userName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: sequelize_1.DataTypes.STRING, // String type for the user's password (typically hashed).
        allowNull: false,
    },
    userType: {
        type: sequelize_1.DataTypes.ENUM('admin'),
        allowNull: false,
        defaultValue: 'admin',
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt columns to track record creation/update times.
});
// Exporting the User model for use in other parts of the application.
exports.default = User;
