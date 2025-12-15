// Importing express
import express from 'express';

// Importing API handlers
import {
    createCategoryHandler,
    getCategoriesHandler,
    getCategoryHandler,
} from '../controllers/categoryController';



// Initialize router
const router = express.Router();

router.post('/add-category', createCategoryHandler);
router.get('', getCategoriesHandler);
router.get('/:id', getCategoryHandler);


export default router;