// Importing req and res from express
import { Request, Response } from 'express';
import cloudinary from '../config/cloudinaryConfig';
import streamifier from "streamifier";
import Archive from '../models/Archive';
import Category from '../models/Category';
import { Op } from 'sequelize';
import Draft from '../models/Draft';


// Helper function to determine media type from MIME type
//  MIME type is detected from the actual file content (magic numbers/file signature), 
// not the filename, making it much more reliable for determining the true file type.
const getMediaTypeFromMimeType = (mimetype: string): string => {
    if (mimetype.startsWith('image/')) {
        return 'image';
    } else if (mimetype.startsWith('video/')) {
        return 'video';
    } else {
        return 'document';
    }
};



// ================================================
// @desc Upload Item
// @route POST /archive-items/upload
// @access Private (Admin only)
// ================================================
export const createArchiveItemHandler = async (req: Request, res: Response) => {
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
        const cloudinaryResult: any = await new Promise((resolve, reject) => {

            // Create a folder on cloudinary
            const folder =
                mediaType === "image"
                    ? "archive-items/images"
                    : mediaType === "video"
                        ? "archive-items/videos"
                        : "archive-items/documents";

            // Tell Cloudinary: “I’m about to send you a file as a stream”
            const stream = cloudinary.uploader.upload_stream(
                {
                    // folder: "archive-items",
                    folder,
                    resource_type: mediaType === "video" ? "video"
                        : mediaType === "image" ? "image"
                            : "raw" // for documents and other files
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            // Convert file buffer into a stream. Send it into Cloudinary
            streamifier.createReadStream(file.buffer).pipe(stream);
        });

        const cloudServiceUrl = cloudinaryResult.secure_url;

        let item;

        // Save item to appropriate table based on visibility in the DB
        if (visibility === 'private') {
            // Save to Drafts table
            item = await Draft.create({
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
            item = await Archive.create({
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error Uploading item...' });
    }
}




// ================================================
// @desc View Archive Items
// @route GET /archive-items
// @access Public
// ================================================
export const getArchiveItemsHandler = async (req: Request, res: Response) => {
    try {
        // Get query parameters from the request (?...)
        const { categoryId, search } = req.query;
        // whereClause object, which will be empty (fetch all archive items) if no categoryId is provided.
        // Object to store filtering conditions
        const whereClause: any = {};

        // If categoryId is provided, filter by it
        if (categoryId) {
            if (typeof categoryId !== "string") {
                res.status(400).json({ message: "Category ID must be a string" });
                return;
            }

            // Verify the category exists
            const category = await Category.findOne({ where: { id: categoryId } });
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
                [Op.iLike]: `%${search}%` // Matches archive item title containing the search query term
            };
        }

        // Fetch archive items with the applied filter (or all archives if no filter)
        const archives = await Archive.findAll({ where: whereClause });
        if (!archives || archives.length === 0) {
            res.status(404).json({ message: "No archives/archive items found" });
            return;
        }

        res.status(200).json(archives);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching archive items.." });
    }
}