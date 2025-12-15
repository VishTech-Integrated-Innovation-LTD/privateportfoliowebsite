// EXTERNAL IMPORTS
import express from 'express';  // Importing express


// INTERNAL IMPORTS
// import config from '../config/config';  // Importing config file to access jwt secret key
// const config = require('../config/config');

// Importing APIs handlers (Controllers)
import {
    createUserHandler,
    loginUserHandler
} from '../controllers/userController';


// Importing Middleware for authentication/validation of tokens 
// import validateToken from '../middleware/verifyToken';


// Initialize router
const router = express.Router();


router.post('/signup', createUserHandler);

router.post('/login', loginUserHandler);





export default router;