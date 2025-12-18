"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUserHandler = exports.createUserHandler = void 0;
// Importing bcrypt for hashing password
const bcrypt_1 = __importDefault(require("bcrypt"));
// Importing User model
const User_1 = __importDefault(require("../models/User"));
// Importing config file to access jwt secret key
// import config from '../config/config';
const config = require('../config/config');
// Importing jwt
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// ================================================
// @desc   Create/Register a User
// @route  POST  /auth/signup
// @access Public
// ================================================
const createUserHandler = async (req, res) => {
    try {
        let { userName, password } = req.body;
        // let { name, email, password, userType, studentStatus } = req.body;
        // Checking for missing fields
        if (!userName || !password) {
            res.status(400).json({
                message: "Please enter all fields",
            });
            return; // This stops the function from going further
        }
        // Validate datatypes
        if (typeof userName !== "string" ||
            typeof password !== "string") {
            res.status(400).json({
                message: "Name and password must be strings"
            });
            return; // This stops the function from going further
        }
        // Checking for password length
        if (password.length < 8) {
            res.status(400).json({
                message: "Password must be at least 8 characters"
            });
            return; // This stops the function from going further
        }
        // Hashing the Password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Creating the user in the database
        const user = await User_1.default.create({
            userName,
            password: hashedPassword,
            userType: 'admin'
        });
        res.status(201).json({ message: "User created successfully", user });
    }
    catch (error) {
        console.error(error);
        // log(error)
        res.status(500).json({ message: "Error creating user" });
    }
};
exports.createUserHandler = createUserHandler;
// ================================================
// @desc    Login User(Admin)
// @route   POST /auth/login
// @access  Public
// ================================================
const loginUserHandler = async (req, res) => {
    try {
        const { userName, password } = req.body;
        // Ensure all fields are present
        if (!userName || !password) {
            res.status(400).json({
                message: 'Please enter your username and password'
            });
            return; // This stops the function from going further
        }
        // Find the user
        const user = await User_1.default.findOne({ where: { userName } });
        // If no user is found
        if (!user) {
            res.status(404).json({
                message: 'User not found'
            });
        }
        // Check if password is valid
        const isPasswordValid = await bcrypt_1.default.compare(password, user === null || user === void 0 ? void 0 : user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                message: 'Invalid password'
            });
            return; // This stops the function from going further
        }
        // Generate/Create JWT (token)
        // Create token payload
        const payload = { id: user === null || user === void 0 ? void 0 : user.id, userName: user === null || user === void 0 ? void 0 : user.userName, userType: user === null || user === void 0 ? void 0 : user.userType };
        // Create JWT token
        const token = jsonwebtoken_1.default.sign(payload, config.jwtSecret, { expiresIn: '7d' });
        // console.log('user-payload type:', payload.userType);
        res.status(200).json({
            message: 'Login/Signin successful',
            token,
            user: {
                id: user === null || user === void 0 ? void 0 : user.id,
                userName: user === null || user === void 0 ? void 0 : user.userName,
                userType: user === null || user === void 0 ? void 0 : user.userType,
            },
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error signing in user" });
    }
};
exports.loginUserHandler = loginUserHandler;
