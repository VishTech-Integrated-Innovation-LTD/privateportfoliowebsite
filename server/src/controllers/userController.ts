// Importing bcrypt for hashing password
import bcrypt from 'bcrypt';
// Importing User model
import User from '../models/User';
// Importing config file to access jwt secret key
// import config from '../config/config';
const config = require('../config/config');
// Importing jwt
import jwt from 'jsonwebtoken';
// Importing req and res from express
import { Request, Response } from 'express';

// Importing dotenv to load env variables
import dotenv from 'dotenv';

// Defining interface for type checking
interface User {
  id: string
  userName: string
  password: string
  userType: 'admin';
}


// ================================================
// @desc   Create/Register a User
// @route  POST  /auth/signup
// @access Public
// ================================================
export const createUserHandler = async (req: Request, res: Response) => {
  try {
    let { userName, password }: User = req.body;
    // let { name, email, password, userType, studentStatus } = req.body;
    // Checking for missing fields
    if (
      !userName || !password
    ) {
      res.status(400).json({
        message: "Please enter all fields",
      });
      return; // This stops the function from going further
    }
    // Validate datatypes
    if (
      typeof userName !== "string" ||
      typeof password !== "string"
    ) {
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
    const hashedPassword = await bcrypt.hash(password, 10);

    // Creating the user in the database
    const user = await User.create({
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


// ================================================
// @desc    Login User(Admin)
// @route   POST /auth/login
// @access  Public
// ================================================
export const loginUserHandler = async (req: Request, res: Response) => {
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
    const user = await User.findOne({ where: { userName } });

    // If no user is found
    if (!user) {
        res.status(404).json({
            message: 'User not found'
        });
    }

    // Check if password is valid
    const isPasswordValid = await bcrypt.compare(password, user?.password as string);
    if (!isPasswordValid) {
      res.status(401).json({
        message: 'Invalid password'
      });
      return; // This stops the function from going further
    }


    // Generate/Create JWT (token)
    // Create token payload
    const payload = { id: user?.id, userName: user?.userName, userType: user?.userType };
    // Create JWT token
    const token = jwt.sign(payload, config.jwtSecret as string, { expiresIn: '7d' });
    // console.log('user-payload type:', payload.userType);
    res.status(200).json({
      message: 'Login/Signin successful', 
      token,
      user: {
                id: user?.id,
                userName: user?.userName,
                userType: user?.userType,
            },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error signing in user" });
  }
}