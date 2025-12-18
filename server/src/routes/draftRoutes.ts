import express from 'express';  // Importing express

const config = require('../config/config');

// Importing APIs handlers (Controllers)
import {
    publishDraftHandler,
    getAllDraftsHandler,
    getDraftByIdHandler,
    updateDraftItemHandler,
    deleteDraftHandler
} from '../controllers/draftController';


// Middleware for verifying/validating token
import validateToken from '../middleware/validateToken';


//  Middleware for file upload
import { uploadMiddleware } from '../middleware/multerConfig';

// Initialize router
const router = express.Router();



// Protected routes (Admin only)
router.post('/:id/publish', validateToken, publishDraftHandler);
router.get('', validateToken, getAllDraftsHandler);
router.get('/:id', validateToken, getDraftByIdHandler);
router.put('/:id', validateToken, uploadMiddleware, updateDraftItemHandler);
router.delete('/:id', validateToken, deleteDraftHandler);


export default router;