"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing express
const express_1 = __importDefault(require("express"));
// Importing dotenv to load env variables
const dotenv_1 = __importDefault(require("dotenv"));
// Loads .env file contents into process.env
dotenv_1.default.config();
// Initialize the Express application
const app = (0, express_1.default)();
// Middleware to parse incoming JSON requests (For communication using json in the server)
app.use(express_1.default.json());
// Importing Routes
// Routes
// app.use();
// Export app
exports.default = app;
