"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteArchiveItemHandler = exports.getArchiveItemsHandler = exports.createArchiveItemHandler = void 0;
const cloudinaryConfig_1 = __importDefault(require("../config/cloudinaryConfig"));
const streamifier_1 = __importDefault(require("streamifier"));
const Archive_1 = __importDefault(require("../models/Archive"));
const Category_1 = __importDefault(require("../models/Category"));
const sequelize_1 = require("sequelize");
const Draft_1 = __importDefault(require("../models/Draft"));
// Helper function to determine media type from MIME type
//  MIME type is detected from the actual file content (magic numbers/file signature), 
// not the filename, making it much more reliable for determining the true file type.
const getMediaTypeFromMimeType = (mimetype) => {
    if (mimetype.startsWith('image/')) {
        return 'image';
    }
    else if (mimetype.startsWith('video/')) {
        return 'video';
    }
    else {
        return 'document';
    }
};
// ================================================
// @desc Upload Item
// @route POST /archive-items/upload
// @access Private (Admin only)
// ================================================
const createArchiveItemHandler = async (req, res) => {
    try {
        const { title, description, CategoryId, visibility, isOnTheMainPage } = req.body;
        // Validate file
        if (!req.file) {
            return res.status(400).json({ message: 'Media file is required' });
        }
        // Store in a local constant to preserve type narrowing
        const file = req.file;
        // Automatically determine mediaType 
        const mediaType = getMediaTypeFromMimeType(file.mimetype);
        // Upload to Cloudinary
        const cloudinaryResult = await new Promise((resolve, reject) => {
            // Create a folder on cloudinary
            const folder = mediaType === "image"
                ? "archive-items/images"
                : mediaType === "video"
                    ? "archive-items/videos"
                    : "archive-items/documents";
            // Tell Cloudinary: “I’m about to send you a file as a stream”
            const stream = cloudinaryConfig_1.default.uploader.upload_stream({
                // folder: "archive-items",
                folder,
                resource_type: mediaType === "video" ? "video"
                    : mediaType === "image" ? "image"
                        : "raw" // for documents and other files
            }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
            // Convert file buffer into a stream. Send it into Cloudinary
            streamifier_1.default.createReadStream(file.buffer).pipe(stream);
        });
        const cloudServiceUrl = cloudinaryResult.secure_url;
        let item;
        // Save item to appropriate table based on visibility in the DB
        if (visibility === 'private') {
            // Save to Drafts table
            item = await Draft_1.default.create({
                title,
                description,
                CategoryId,
                mediaType,
                visibility,
                cloudServiceUrl
            });
        }
        else {
            // Save to Archive table (public)
            item = await Archive_1.default.create({
                title,
                description,
                CategoryId,
                mediaType,
                visibility,
                isOnTheMainPage,
                cloudServiceUrl
            });
        }
        // // Save item to DB
        // const item = await Archive.create({
        //     title,
        //     description,
        //     CategoryId,
        //     mediaType,
        //     visibility,
        //     isOnTheMainPage,
        //     cloudServiceUrl
        // });
        res.status(201).json({
            message: `Item uploaded successfully as ${visibility === 'private' ? 'draft' : 'archive'}`,
            item,
            savedTo: visibility === 'private' ? 'Drafts' : 'Archives'
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error Uploading item...' });
    }
};
exports.createArchiveItemHandler = createArchiveItemHandler;
// ================================================
// @desc View Archive Items
// @route GET /archive-items
// @access Public
// ================================================
const getArchiveItemsHandler = async (req, res) => {
    try {
        // Get query parameters from the request (?...)
        const { categoryId, search } = req.query;
        // whereClause object, which will be empty (fetch all archive items) if no categoryId is provided.
        // Object to store filtering conditions
        const whereClause = {};
        // If categoryId is provided, filter by it
        if (categoryId) {
            if (typeof categoryId !== "string") {
                res.status(400).json({ message: "Category ID must be a string" });
                return;
            }
            // Verify the category exists
            const category = await Category_1.default.findOne({ where: { id: categoryId } });
            if (!category) {
                res.status(400).json({ message: "Category not found" });
                return;
            }
            whereClause.CategoryId = categoryId;
        }
        // Handle search filter if provided
        if (search) {
            if (typeof search !== "string") {
                res.status(400).json({ message: "Search Query must be a string" });
                return;
            }
            // Search condition to filter by archive item title (case insensitive)
            whereClause.title = {
                [sequelize_1.Op.iLike]: `%${search}%` // Matches archive item title containing the search query term
            };
        }
        // Fetch archive items with the applied filter (or all archives if no filter)
        const archives = await Archive_1.default.findAll({ where: whereClause });
        if (!archives || archives.length === 0) {
            res.status(404).json({ message: "No archives/archive items found" });
            return;
        }
        res.status(200).json(archives);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching archive items.." });
    }
};
exports.getArchiveItemsHandler = getArchiveItemsHandler;
// ================================================
// @desc Delete an archive item
// @route DELETE /archive-items/:id
// @access Private (Admin only)
// ================================================
const deleteArchiveItemHandler = async (req, res) => {
    try {
        const { id } = req.params;
        // Find the archive item
        const archiveItem = await Archive_1.default.findByPk(id);
        if (!archiveItem) {
            res.status(404).json({ message: "Archive item not found" });
            return;
        }
        // Delete from Cloudinary
        // Delete from database
        await archiveItem.destroy();
        res.status(200).json({ message: "Archive item deleted successfully" });
    }
    catch (error) {
        console.error('Error deleting archive item:', error);
        res.status(500).json({ message: 'Error deleting archive item...' });
    }
};
exports.deleteArchiveItemHandler = deleteArchiveItemHandler;
