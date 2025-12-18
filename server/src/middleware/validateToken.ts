import jwt from "jsonwebtoken";
// Importing User model
import User from "../models/User";
const config = require('../config/config') // Importing config so we can have our 'Secret' here 
// Importing req, res and next from express -
// Request, Response, and NextFunction from Express for type definitions
import { Request, Response, NextFunction } from "express";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: typeof User.prototype; // or User instance type
    }
  }
}

// Interface for decoded JWT payload to ensure type safety
interface DecodedJWToken {
  id: string; // User ID from the JWT
  userType: "admin";
}

const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
    const decodedToken = jwt.verify(
      token,
      config.jwtSecret as string
    ) as DecodedJWToken;
    console.log("Decoded token:", decodedToken);

    // Check if token is invalid or expired
    if (!decodedToken) {
      res.status(401).json({
        message: "Invalid Token",
      });
      return; // Stop execution if token verification fails
    }

         const user = await User.findByPk(decodedToken.id);
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
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
    });
  }
}; 

export default validateToken;


