"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/index.ts
require("./Archive");
require("./Collection");
require("./CollectionItem");
require("./Category");
const db_1 = __importDefault(require("../db"));
// Call all associations
const models = db_1.default.models;
Object.values(models).forEach((model) => {
    if (model.associate) {
        model.associate(models);
    }
});
exports.default = db_1.default;
