import express from 'express';  // Importing express

const config = require('../config/config');

// Importing APIs handlers (Controllers)
import {
createArchiveItemHandler,
getArchiveItemsHandler
} from '../controllers/archiveItemController';


// Middleware for file upload
import { uploadMiddleware } from '../middleware/multerConfig';


// Initialize router
const router = express.Router();


router.post('/upload', uploadMiddleware, createArchiveItemHandler);
router.get('', getArchiveItemsHandler);



export default router;