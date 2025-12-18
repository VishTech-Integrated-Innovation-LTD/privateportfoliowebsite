"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // Importing express
const config = require('../config/config');
// Importing APIs handlers (Controllers)
const collectionController_1 = require("../controllers/collectionController");
// Middleware for verifying/validating token
const validateToken_1 = __importDefault(require("../middleware/validateToken"));
// Initialize router
const router = express_1.default.Router();
// Public routes
// Protected routes (Admin only)
router.post('/create', validateToken_1.default, collectionController_1.createCollectionHandler);
router.delete('/:id', validateToken_1.default, collectionController_1.deleteCollectionHandler);
exports.default = router;
