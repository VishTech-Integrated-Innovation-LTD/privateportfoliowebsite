import multer from "multer";

/**
 * Configure Multer storage for file uploads.
 */
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 2 }, // Limit file size to 2MB
});

// Export the Multer instance for use in routes
export default upload;

/**
 * Middleware to handle single file upload.
 * Processes the uploaded file and attaches it to req.file.
 */
export const uploadMiddleware = upload.single('media');