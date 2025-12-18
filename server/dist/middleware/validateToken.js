"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Importing User model
const User_1 = __importDefault(require("../models/User"));
const config = require('../config/config'); // Importing config so we can have our 'Secret' here 
const validateToken = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            res.status(401).json({
                message: 'Authorization header is required',
            });
            return;
        }
        const token = req.headers.authorization.split(' ')[1]; // to remove the 'Bearer' keyword and display only the token
        if (!token) {
            res.status(401).json({
                message: "Access denied. No token provided",
            });
            return;
        }
        // Verify Token
        // Verify and decode JWT using the secret key
        const decodedToken = jsonwebtoken_1.default.verify(token, config.jwtSecret);
        console.log("Decoded token:", decodedToken);
        // Check if token is invalid or expired
        if (!decodedToken) {
            res.status(401).json({
                message: "Invalid Token",
            });
            return; // Stop execution if token verification fails
        }
        const user = await User_1.default.findByPk(decodedToken.id);
        if (!user) {
            res.status(401).json({
                message: 'Error fetching the user',
            });
            return;
        }
        // whatever API this middleware is put on, inside that API you'll have access to the full user object or details 
        //  the logged in user info is stored here...
        req.user = user;
        // Proceed to the next middleware or route handler
        next();
    }
    catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
exports.default = validateToken;
