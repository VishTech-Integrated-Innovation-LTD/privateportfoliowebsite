// Importing req and res from express
import { Request, Response } from 'express';
import Draft from '../models/Draft';
import Archive from '../models/Archive';
import cloudinary from '../config/cloudinaryConfig';
import streamifier from "streamifier";



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
// @desc Move draft item to archive (publish)
// @route POST /drafts/:id/publish
// @access Private (Admin only)
// ================================================
export const publishDraftHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // const { visibility } = req.body; // 'public' or 'private'

        // Find the draft
        const draft = await Draft.findByPk(id);

        if (!draft) {
            return res.status(404).json({ message: 'Draft not found' });
        }

        // Default to 'public' if visibility not provided
        // const finalVisibility = visibility || 'public';
        const finalVisibility = 'public';

        // Validate visibility if provided
        // if (!visibility || !['public', 'private'].includes(visibility)) {
        //     return res.status(400).json({
        //         message: 'Valid visibility is required (public or private)'
        //     });
        // }

        // Create archive item from draft
        const archiveItem = await Archive.create({
            title: draft.title,
            description: draft.description,
            CategoryId: draft.CategoryId,
            mediaType: draft.mediaType,
            visibility: finalVisibility,
            isOnTheMainPage: false,
            cloudServiceUrl: draft.cloudServiceUrl
        });

        // Delete the draft
        await draft.destroy();

        res.status(201).json({
            message: 'Draft published successfully',
            item: archiveItem
        });

    } catch (error) {
        console.error('Error publishing draft:', error);
        res.status(500).json({ message: 'Error publishing draft...' });
    }
}




// ================================================
// @desc Get all drafts
// @route GET /drafts
// @access Private (Admin only)
// ================================================
export const getAllDraftsHandler = async (req: Request, res: Response) => {
    try {
        const drafts = await Draft.findAll();

        res.status(200).json({
            message: 'Drafts retrieved successfully',
            count: drafts.length,
            drafts
        });

    } catch (error) {
        console.error('Error fetching drafts:', error);
        res.status(500).json({ message: 'Error fetching drafts...' });
    }
};




// ================================================
// @desc Get draft by ID
// @route GET /drafts/:id
// @access Private (Admin only)
// ================================================
export const getDraftByIdHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const draft = await Draft.findByPk(id);

        if (!draft) {
            return res.status(404).json({ message: 'Draft not found' });
        }

        res.status(200).json({
            message: 'Draft retrieved successfully',
            draft
        });

    } catch (error) {
        console.error('Error fetching draft:', error);
        res.status(500).json({ message: 'Error fetching draft...' });
    }
};



// ================================================
// @desc Edit/Update a draft item
// @route PUT /drafts/edit/:id
// @access Private (Admin only)
// ================================================

// export const updateDraftItemHandler = async (req: Request, res: Response) => {
//     try {
//         const { id } = req.params;
//         const { title, description, CategoryId, visibility } = req.body;

//         // Find the draft item
//         const draftItem = await Draft.findByPk(id);

//         if (!draftItem) {
//             return res.status(404).json({ message: 'Draft item not found' });
//         }

//         // Validate file
//         if (!req.file) {
//             return res.status(400).json({ message: 'Media file is required' });
//         }

//         const file = req.file;
//         const mediaType = getMediaTypeFromMimeType(file.mimetype);

//         // Delete old file from Cloudinary
//         if (draftItem.cloudServiceUrl) {
//             try {
//                 const urlParts = draftItem.cloudServiceUrl.split('/');
//                 const uploadIndex = urlParts.indexOf('upload');
//                 const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');
//                 const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));

//                 const resourceType = draftItem.mediaType === 'video' ? 'video'
//                     : draftItem.mediaType === 'image' ? 'image'
//                         : 'raw';

//                 await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
//             } catch (cloudinaryError) {
//                 console.error('Error deleting old file from Cloudinary:', cloudinaryError);
//                 // Continue with upload even if deletion fails
//             }
//         }

//         // Upload new file to Cloudinary
//         const cloudinaryResult: any = await new Promise((resolve, reject) => {
//             const folder =
//                 mediaType === "image"
//                     ? "archive-items/images"
//                     : mediaType === "video"
//                         ? "archive-items/videos"
//                         : "archive-items/documents";

//             const stream = cloudinary.uploader.upload_stream(
//                 {
//                     folder,
//                     resource_type: mediaType === "video" ? "video"
//                         : mediaType === "image" ? "image"
//                             : "raw"
//                 },
//                 (error, result) => {
//                     if (error) reject(error);
//                     else resolve(result);
//                 }
//             );

//             streamifier.createReadStream(file.buffer).pipe(stream);
//         });

//         const cloudServiceUrl = cloudinaryResult.secure_url;



//         // If visibility is changing to 'public', move to Archive table
//         if (visibility && visibility !== 'private') {
//             // Create in Archive table
//             const archiveItem = await Archive.create({
//                 title: title || draftItem.title,
//                 description: description || draftItem.description,
//                 CategoryId: CategoryId || draftItem.CategoryId,
//                 mediaType: draftItem.mediaType,
//                 visibility: visibility,
//                 isOnTheMainPage: false, // Default to false when publishing
//                 cloudServiceUrl
//             });

//             // Delete from Draft table
//             await draftItem.destroy();

//             return res.status(200).json({
//                 message: 'Draft item published successfully',
//                 item: archiveItem,
//                 movedTo: 'Archives'
//             });
//         }

//         // If it's still a draft, just update it
//         await draftItem.update({
//             title: title || draftItem.title,
//             description: description || draftItem.description,
//             CategoryId: CategoryId || draftItem.CategoryId,
//             visibility: 'private', // Drafts are always private
//             cloudServiceUrl
//         });

//         res.status(200).json({
//             message: 'Draft item updated successfully',
//             item: draftItem
//         });
//     } catch (error) {
//         console.error('Error updating draft item:', error);
//         res.status(500).json({ message: 'Error updating draft item...' });
//     }
// }



export const updateDraftItemHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, CategoryId, visibility } = req.body;

    // Find the draft item
    const draftItem = await Draft.findByPk(id);
    if (!draftItem) {
      return res.status(404).json({ message: 'Draft item not found' });
    }

    let cloudServiceUrl = draftItem.cloudServiceUrl;
    let mediaType = draftItem.mediaType;

    // === File replacement – ONLY if a new file is uploaded ===
    if (req.file) {
      const file = req.file;
      mediaType = getMediaTypeFromMimeType(file.mimetype);

      // Delete old file from Cloudinary (if exists)
      if (draftItem.cloudServiceUrl) {
        try {
          const urlParts = draftItem.cloudServiceUrl.split('/');
          const uploadIndex = urlParts.indexOf('upload');
          const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');
          const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));

          const resourceType =
            draftItem.mediaType === 'video' ? 'video'
            : draftItem.mediaType === 'image' ? 'image'
            : 'raw';

          await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        } catch (cloudinaryError) {
          console.error('Error deleting old file from Cloudinary:', cloudinaryError);
          // Continue even if deletion fails
        }
      }

      // Upload new file
      const cloudinaryResult: any = await new Promise((resolve, reject) => {
        const folder =
          mediaType === "image" ? "archive-items/images"
          : mediaType === "video" ? "archive-items/videos"
          : "archive-items/documents";

        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: mediaType === "video" ? "video"
              : mediaType === "image" ? "image"
              : "raw"
          },
          (error, result) => error ? reject(error) : resolve(result)
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      });

      cloudServiceUrl = cloudinaryResult.secure_url;
    }

    // Update draft (file fields only change if new file was uploaded)
    await draftItem.update({
      title: title || draftItem.title,
      description: description || draftItem.description,
      CategoryId: CategoryId || draftItem.CategoryId,
      mediaType,           // only changes if new file
      visibility: 'private', // drafts stay private
      cloudServiceUrl      // only changes if new file
    });

    res.status(200).json({
      message: 'Draft item updated successfully',
      item: draftItem
    });
  } catch (error) {
    console.error('Error updating draft item:', error);
    res.status(500).json({ message: 'Error updating draft item...' });
  }
};




// ================================================
// @desc Delete a draft
// @route DELETE /drafts/:id
// @access Private (Admin only)
// ================================================
export const deleteDraftHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const draft = await Draft.findByPk(id);

        if (!draft) {
            return res.status(404).json({ message: 'Draft not found' });
        }

        // Delete from Cloudinary if needed
        if (draft.cloudServiceUrl) {
            try {
                const urlParts = draft.cloudServiceUrl.split('/');
                const uploadIndex = urlParts.indexOf('upload');
                const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');
                const publicId = publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));

                const resourceType = draft.mediaType === 'video' ? 'video'
                    : draft.mediaType === 'image' ? 'image'
                        : 'raw';

                await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
            } catch (cloudinaryError) {
                console.error('Error deleting from Cloudinary:', cloudinaryError);
            }
        }

        await draft.destroy();

        res.status(200).json({
            message: 'Draft deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting draft:', error);
        res.status(500).json({ message: 'Error deleting draft...' });
    }
};













// ================================================
// @desc Edit/Update a draft item
// @route PUT /drafts/:id
// @access Private (Admin only)
// ================================================
// export const updateDraftItemHandler = async (req: Request, res: Response) => {
//     try {
//         const { id } = req.params;
//         const { title, description, CategoryId, visibility } = req.body;

//         // Find the draft item
//         const draftItem = await Draft.findByPk(id);

//         if (!draftItem) {
//             return res.status(404).json({ message: 'Draft item not found' });
//         }

//         // If visibility is changing to 'public', move to Archive table
//         if (visibility && visibility !== 'private') {
//             // Create in Archive table
//             const archiveItem = await Archive.create({
//                 title: title || draftItem.title,
//                 description: description || draftItem.description,
//                 CategoryId: CategoryId || draftItem.CategoryId,
//                 mediaType: draftItem.mediaType,
//                 visibility: visibility,
//                 isOnTheMainPage: false, // Default to false when publishing
//                 cloudServiceUrl: draftItem.cloudServiceUrl
//             });

//             // Delete from Draft table
//             await draftItem.destroy();

//             return res.status(200).json({
//                 message: 'Draft item published successfully',
//                 item: archiveItem,
//                 movedTo: 'Archives'
//             });
//         }

//         // If it's still a draft, just update it
//         await draftItem.update({
//             title: title || draftItem.title,
//             description: description || draftItem.description,
//             CategoryId: CategoryId || draftItem.CategoryId,
//             visibility: 'private' // Drafts are always private
//         });

//         res.status(200).json({
//             message: 'Draft item updated successfully',
//             item: draftItem
//         });
//     } catch (error) {
//         console.error('Error updating draft item:', error);
//         res.status(500).json({ message: 'Error updating draft item...' });
//     }
// }