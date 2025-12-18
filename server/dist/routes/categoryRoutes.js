"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importing express
const express_1 = __importDefault(require("express"));
// Importing API handlers
const categoryController_1 = require("../controllers/categoryController");
// Initialize router
const router = express_1.default.Router();
router.post('/add-category', categoryController_1.createCategoryHandler);
router.get('', categoryController_1.getCategoriesHandler);
router.get('/:id', categoryController_1.getCategoryHandler);
exports.default = router;
