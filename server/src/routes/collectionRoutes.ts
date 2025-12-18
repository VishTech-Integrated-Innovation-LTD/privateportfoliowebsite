import express from 'express';  // Importing express

const config = require('../config/config');

// Importing APIs handlers (Controllers)
import {
createCollectionHandler,
getAllCollectionsHandler,
getCollectionByIdHandler,
updateCollectionHandler,
deleteCollectionHandler
} from '../controllers/collectionController';


// Middleware for verifying/validating token
import validateToken from '../middleware/validateToken';


// Initialize router
const router = express.Router();

// Public routes
router.get('', getAllCollectionsHandler);
router.get('/:id', getCollectionByIdHandler);


// Protected routes (Admin only)
router.post('/create', validateToken, createCollectionHandler);
router.put('/:id', validateToken, updateCollectionHandler);
router.delete('/:id', validateToken, deleteCollectionHandler);



export default router;