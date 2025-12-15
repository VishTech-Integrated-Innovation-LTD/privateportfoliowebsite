"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
const Archive_1 = __importDefault(require("./Archive"));
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
    },
    ArchiveId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'Archives', key: 'id' }
    }
}, {
    timestamps: true,
});
Collection.belongsTo(Archive_1.default);
exports.default = Collection;
