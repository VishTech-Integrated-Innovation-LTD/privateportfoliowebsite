"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
/**
 * Configure Multer storage for file uploads.
 */
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 1024 * 1024 * 2 }, // Limit file size to 2MB
});
// Export the Multer instance for use in routes
exports.default = upload;
/**
 * Middleware to handle single file upload.
 * Processes the uploaded file and attaches it to req.file.
 */
exports.uploadMiddleware = upload.single('media');
