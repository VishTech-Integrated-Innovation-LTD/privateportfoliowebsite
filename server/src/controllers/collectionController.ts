import { Request, Response } from 'express';
import Archive from '../models/Archive';
import Collection from '../models/Collection';
import CollectionItem from '../models/CollectionItem';



// ================================================
// @desc Create a collection with multiple archives
// @route POST /collections/create
// @access Private (Admin only)
// This handler:
//       Validates input
//       Verifies archive IDs
//       Checks if the collection already exist
//       Creates a collection
//       Links archives to it
//       Returns the complete collection
// ================================================
export const createCollectionHandler = async (req: Request, res: Response) => {
    try {
        const { name, description, archiveIds } = req.body; // Array of archive IDs

        // Validate required fields
        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Collection name is required' });
        }

        if (!description || !description.trim()) {
            return res.status(400).json({ message: 'Collection description is required' });
        }

        if (!archiveIds || !Array.isArray(archiveIds) || archiveIds.length === 0) {
            return res.status(400).json({ message: 'At least one archive item is required' });
        }

        // Checking if the collection already exists
        const existingCollection = await Collection.findOne({
            where: { name: name.trim() },
        });
        if (existingCollection) {
            return res.status(400).json({ message: "Collection already exists.." });
        }

        // Verify all archives exist
        const existingArchives = await Archive.findAll({
            where: { id: archiveIds }
        });

        if (existingArchives.length !== archiveIds.length) {
            return res.status(404).json({
                message: 'Some archive items were not found',
                found: existingArchives.length,
                requested: archiveIds.length
            });
        }


        // Create the collection
        const collection = await Collection.create({
            name: name.trim(),
            description: description.trim()
        });

        // Add archives to collection
        // Prepare junction table records
        // Converts archive IDs into records for the many-to-many junction table.
        const collectionItems: any = archiveIds.map((archiveId: string) => ({
            CollectionId: collection.id,
            ArchiveId: archiveId
        }));


        // Insert into junction table
        // Inserts all relations at once (efficient).
        // Links archives to the collection.
        await CollectionItem.bulkCreate(collectionItems);

        // Fetch complete collection with archives
        const completeCollection = await Collection.findByPk(collection.id)

        // Send success response
        res.status(201).json({
            message: 'Collection created successfully',
            collection: completeCollection,
            collectionItems: collectionItems
        });
    } catch (error) {
        console.error('Error creating collection:', error);
        res.status(500).json({ message: 'Error creating a collection...' });
    }
}




// ================================================
// @desc Get all collections with their archives
// @route GET /collections
// @access Public
// ================================================
export const getAllCollectionsHandler = async (req: Request, res: Response) => {
    try {
        const collections = await Collection.findAll();
        res.status(200).json({
            message: 'Collections retrieved successfully',
            count: collections.length,
            collections
        });
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ message: 'Error fetching collections...' });
    }
}




// ================================================
// @desc Get a single collection by ID
// @route GET /collections/:id
// @access Public
// ================================================
export const getCollectionByIdHandler = async (req: Request, res: Response) => {
    try {
        const collectionId = req.params.id;

        const collection = await Collection.findByPk(collectionId);

        if (!collection) {
            res.status(404).json({ message: "Collection not found" });
            return;
        }

        res.status(200).json({
            message: 'Collection retrieved successfully',
            collection
        });
    } catch (error) {
        console.error('Error fetching collection:', error);
        res.status(500).json({ message: 'Error fetching collection...' });
    }
}




// ================================================
// @desc Edit/Update a collection
// @route PUT /collections/:id
// @access Private (Admin only)
// ================================================
export const updateCollectionHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        // Find the collection
        const collection = await Collection.findByPk(id);
        
        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }

          // If changing name, check if new name already exists
        if (name && name.trim() !== collection.name) {
            const existingCollection = await Collection.findOne({
                where: { name: name.trim() }
            });
            
            if (existingCollection) {
                return res.status(400).json({ message: 'Collection name already exists' });
            }
        }

        // Update the collection
        await collection.update({
            name: name.trim(),
            description: description.trim()
        });

         res.status(200).json({
            message: 'Collection updated successfully',
            collection
        });
      

    } catch (error) {
        console.error('Error updating collection:', error);
        res.status(500).json({ message: 'Error updating collection...' });
    }
}



// ================================================
// @desc Delete a collection
// @route DELETE /collections/:id
// @access Private (Admin only)
// ================================================
export const deleteCollectionHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Find the collection
        const collection = await Collection.findByPk(id);
        if (!collection) {
            res.status(404).json({ message: "Collection not found" });
            return;
        }

        // Delete the collection (CollectionItems should also cascade delete)
        await collection.destroy();

        res.status(200).json({ message: "Collection deleted successfully" });
    } catch (error) {
        console.error('Error deleting collection:', error);
        res.status(500).json({ message: 'Error deleting collection...' });
    }
};
