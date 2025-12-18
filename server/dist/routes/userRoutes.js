"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// EXTERNAL IMPORTS
const express_1 = __importDefault(require("express")); // Importing express
// INTERNAL IMPORTS
// import config from '../config/config';  // Importing config file to access jwt secret key
// const config = require('../config/config');
// Importing APIs handlers (Controllers)
const userController_1 = require("../controllers/userController");
// Importing Middleware for authentication/validation of tokens 
// import validateToken from '../middleware/verifyToken';
// Initialize router
const router = express_1.default.Router();
router.post('/signup', userController_1.createUserHandler);
router.post('/login', userController_1.loginUserHandler);
exports.default = router;
