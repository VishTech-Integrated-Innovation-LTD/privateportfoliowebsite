"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // Importing express
const config = require('../config/config');
// Importing APIs handlers (Controllers)
const archiveItemController_1 = require("../controllers/archiveItemController");
// Middleware for file upload
const multerConfig_1 = require("../middleware/multerConfig");
// Middleware for verifying/validating token
const validateToken_1 = __importDefault(require("../middleware/validateToken"));
// Initialize router
const router = express_1.default.Router();
// Public routes
router.get('', archiveItemController_1.getArchiveItemsHandler);
router.get('/:id', archiveItemController_1.getArchiveItemByIdHandler);
// Protected routes (Admin only)
router.post('/upload', validateToken_1.default, multerConfig_1.uploadMiddleware, archiveItemController_1.createArchiveItemHandler);
router.put('/:id', validateToken_1.default, multerConfig_1.uploadMiddleware, archiveItemController_1.updateArchiveItemHandler);
router.delete('/:id', validateToken_1.default, archiveItemController_1.deleteArchiveItemHandler);
exports.default = router;
