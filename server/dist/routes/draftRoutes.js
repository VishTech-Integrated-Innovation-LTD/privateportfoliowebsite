"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // Importing express
const config = require('../config/config');
// Importing APIs handlers (Controllers)
const draftController_1 = require("../controllers/draftController");
// Middleware for verifying/validating token
const validateToken_1 = __importDefault(require("../middleware/validateToken"));
//  Middleware for file upload
const multerConfig_1 = require("../middleware/multerConfig");
// Initialize router
const router = express_1.default.Router();
// Protected routes (Admin only)
router.post('/:id/publish', validateToken_1.default, draftController_1.publishDraftHandler);
router.get('', validateToken_1.default, draftController_1.getAllDraftsHandler);
router.get('/:id', validateToken_1.default, draftController_1.getDraftByIdHandler);
router.put('/:id', validateToken_1.default, multerConfig_1.uploadMiddleware, draftController_1.updateDraftItemHandler);
router.delete('/:id', validateToken_1.default, draftController_1.deleteDraftHandler);
exports.default = router;
