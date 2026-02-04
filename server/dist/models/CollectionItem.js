"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
const Archive_1 = __importDefault(require("./Archive"));
const Collection_1 = __importDefault(require("./Collection"));
// Define the base model and cast after defining
const CollectionItem = db_1.default.define("CollectionItem", {
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
    CollectionId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'Collections', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    ArchiveId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: { model: 'Archives', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
}, {
    timestamps: true,
});
CollectionItem.belongsTo(Archive_1.default, { foreignKey: 'ArchiveId' });
CollectionItem.belongsTo(Collection_1.default, { foreignKey: 'CollectionId' });
// (CollectionItem as any).associate = (models: any) => {
//   CollectionItem.belongsTo(models.Archive, { foreignKey: 'ArchiveId' });
//   CollectionItem.belongsTo(models.Collection, { foreignKey: 'CollectionId' });
// };
exports.default = CollectionItem;
