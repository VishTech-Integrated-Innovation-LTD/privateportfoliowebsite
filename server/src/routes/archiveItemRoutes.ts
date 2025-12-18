import express from 'express';  // Importing express

const config = require('../config/config');

// Importing APIs handlers (Controllers)
import {
createArchiveItemHandler,
getArchiveItemsHandler,
getArchiveItemByIdHandler,
updateArchiveItemHandler,
deleteArchiveItemHandler
} from '../controllers/archiveItemController';


// Middleware for file upload
import { uploadMiddleware } from '../middleware/multerConfig';

// Middleware for verifying/validating token
import validateToken from '../middleware/validateToken';


// Initialize router
const router = express.Router();

// Public routes
router.get('', getArchiveItemsHandler);
router.get('/:id', getArchiveItemByIdHandler);


// Protected routes (Admin only)
router.post('/upload', validateToken, uploadMiddleware, createArchiveItemHandler);
router.put('/:id', validateToken, uploadMiddleware, updateArchiveItemHandler);
router.delete('/:id', validateToken, deleteArchiveItemHandler);



export default router;