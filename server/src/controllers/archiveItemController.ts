// Importing req and res from express
import { Request, Response } from 'express';
import cloudinary from '../config/cloudinaryConfig';
import streamifier from "streamifier";
import Archive from '../models/Archive';
import Category from '../models/Category';
import { Op } from 'sequelize';
import Draft from '../models/Draft';
import Collection from '../models/Collection';


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

        // After getting title

        const existingItem = await Archive.findOne({ where: { title } });

        if (visibility === 'private') {

            const existingDraft = await Draft.findOne({ where: { title } });

            if (existingDraft) {

                return res.status(400).json({ message: "A draft with this title already exists." });

            }

        } else if (existingItem) {

            return res.status(400).json({ message: "An item with this title already exists." });

        }

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




// ================================================
// @desc Get archive item by ID
// @route GET /archive-items/:id
// @access Public
// ================================================
// export const getArchiveItemByIdHandler = async (req: Request, res: Response) => {
//     try {
//         const { id } = req.params;

//         const archiveItem = await Archive.findByPk(id);

//         if (!archiveItem) {
//             return res.status(404).json({ message: "Archive item not found" });
//         }

//         res.status(200).json({
//             message: 'Archive Item retrieved/fetched successfully',
//             item: archiveItem
//         });
//     } catch (error) {
//         console.error('Error fetching archive item:', error);
//         res.status(500).json({ message: 'Error fetching archive item...' });
//     }
// }


export const getArchiveItemByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const archiveItem = await Archive.findByPk(id, {
      include: [
        {
          model: Collection,
          through: { attributes: [] }, // Don't need junction table data
          attributes: ['id', 'name'],
          as: 'Collections' // Must match your belongsToMany alias
        },
        {
          model: Category,
          attributes: ['id', 'name']
        }
      ]
    });

    if (!archiveItem) {
      return res.status(404).json({ message: "Archive item not found" });
    }

    res.status(200).json({
      message: 'Archive Item retrieved successfully',
      item: archiveItem
    });
  } catch (error) {
    console.error('Error fetching archive item:', error);
    res.status(500).json({ message: 'Error fetching archive item...' });
  }
};






// ================================================
// @desc Edit/Update an archive item
// @route PUT /archive-items/edit/:id
// @access Private (Admin only)
// ================================================
export const updateArchiveItemHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, CategoryId, visibility, isOnTheMainPage } = req.body;

        // Find the archive item
        const archiveItem = await Archive.findByPk(id);

        if (!archiveItem) {
            return res.status(404).json({ message: 'Archive item not found' });
        }

        // Validate file
        if (!req.file) {
            return res.status(400).json({ message: 'Media file is required' });
        }

        const file = req.file;
        const mediaType = getMediaTypeFromMimeType(file.mimetype);

        // Delete old file from Cloudinary
        if (archiveItem.cloudServiceUrl) {
            try {
                const urlParts = archiveItem.cloudServiceUrl.split('/');
                const uploadIndex = urlParts.indexOf('upload');
                const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');
                const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));

                const resourceType = archiveItem.mediaType === 'video' ? 'video'
                    : archiveItem.mediaType === 'image' ? 'image'
                        : 'raw';

                await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
            } catch (cloudinaryError) {
                console.error('Error deleting old file from Cloudinary:', cloudinaryError);
                // Continue with upload even if deletion fails
            }
        }

        // Upload new file to Cloudinary
        const cloudinaryResult: any = await new Promise((resolve, reject) => {
            const folder =
                mediaType === "image"
                    ? "archive-items/images"
                    : mediaType === "video"
                        ? "archive-items/videos"
                        : "archive-items/documents";

            const stream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: mediaType === "video" ? "video"
                        : mediaType === "image" ? "image"
                            : "raw"
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            streamifier.createReadStream(file.buffer).pipe(stream);
        });

        const cloudServiceUrl = cloudinaryResult.secure_url;

        // Update the archive item
        await archiveItem.update({
            title: title || archiveItem.title,
            description: description || archiveItem.description,
            CategoryId: CategoryId || archiveItem.CategoryId,
            mediaType,
            visibility: visibility || archiveItem.visibility,
            isOnTheMainPage: isOnTheMainPage !== undefined ? isOnTheMainPage : archiveItem.isOnTheMainPage,
            cloudServiceUrl
        });

        res.status(200).json({
            message: 'Archive item updated successfully',
            item: archiveItem
        });
    } catch (error) {
        console.error('Error updating archive item:', error);
        res.status(500).json({ message: 'Error updating archive item...' });
    }
}



// ================================================
// @desc Delete an archive item
// @route DELETE /archive-items/:id
// @access Private (Admin only)
// ================================================
export const deleteArchiveItemHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Find the archive item
        const archiveItem = await Archive.findByPk(id);
        if (!archiveItem) {
            return res.status(404).json({ message: "Archive item not found" });
        }

        // Delete from Cloudinary
        // Get the Cloudinary file URL stored on the archive record
        // This URL will be used to extract the public_id needed for deletion
        const cloudinaryUrl = archiveItem.cloudServiceUrl;
        if (cloudinaryUrl) {
            try {
                // ----------------------------------------------------
                // STEP 1: Break the Cloudinary URL into parts
                // ----------------------------------------------------
                // Example URL:
                // https://res.cloudinary.com/demo/image/upload/v1234567890/archive-items/images/sample.jpg
                const urlParts = cloudinaryUrl.split('/');

                // ----------------------------------------------------
                // STEP 2: Locate the "upload" segment in the URL
                // ----------------------------------------------------
                // Everything after "upload/<version>/" forms the public_id
                const uploadIndex = urlParts.indexOf('upload');

                // ----------------------------------------------------
                // STEP 3: Extract the public_id INCLUDING file extension
                // ----------------------------------------------------
                // Skips: [uploadIndex+2]
                //  - "upload"
                //  - version number (e.g. v1234567890)
                // Joins the remaining path back into a string
                const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');

                // ----------------------------------------------------
                // STEP 4: Remove the file extension
                // ----------------------------------------------------
                // Cloudinary expects public_id WITHOUT extensions (.jpg, .png, .mp4)
                const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));

                // ----------------------------------------------------
                // STEP 5: Determine Cloudinary resource type
                // ----------------------------------------------------
                // Cloudinary requires the correct resource type to delete files
                // - video → videos
                // - image → images
                // - raw   → documents (PDFs, ZIPs, etc.)
                const resourceType =
                    archiveItem.mediaType === 'video' ? 'video'
                        : archiveItem.mediaType === 'image' ? 'image'
                            : 'raw'

                // ----------------------------------------------------
                // STEP 6: Delete the file from Cloudinary
                // ----------------------------------------------------
                await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
            } catch (cloudinaryError) {
                // ----------------------------------------------------
                // Cloudinary deletion failure should NOT block DB deletion
                // ----------------------------------------------------
                console.error('Error deleting from Cloudinary:', cloudinaryError);
            }
        }
        // ------------------------------------------------------------
        // STEP 7: Delete archive record from the database
        // ------------------------------------------------------------
        // ON DELETE CASCADE is configured so, related CollectionItems
        // will be removed automatically

        // Delete from database
        await archiveItem.destroy();

        return res.status(200).json({ message: "Archive item deleted successfully" });
    } catch (error) {
        console.error('Error deleting archive item:', error);
        return res.status(500).json({ message: 'Error deleting archive item...' });
    }
};