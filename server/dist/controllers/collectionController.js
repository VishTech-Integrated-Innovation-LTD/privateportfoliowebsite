"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCollectionHandler = exports.createCollectionHandler = void 0;
const Archive_1 = __importDefault(require("../models/Archive"));
const Collection_1 = __importDefault(require("../models/Collection"));
const CollectionItem_1 = __importDefault(require("../models/CollectionItem"));
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
const createCollectionHandler = async (req, res) => {
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
        const existingCollection = await Collection_1.default.findOne({
            where: { name: name.trim() },
        });
        if (existingCollection) {
            return res.status(400).json({ message: "Collection already exists.." });
        }
        // Verify all archives exist
        const existingArchives = await Archive_1.default.findAll({
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
        const collection = await Collection_1.default.create({
            name: name.trim(),
            description: description.trim()
        });
        // Add archives to collection
        // Prepare junction table records
        // Converts archive IDs into records for the many-to-many junction table.
        const collectionItems = archiveIds.map((archiveId) => ({
            CollectionId: collection.id,
            ArchiveId: archiveId
        }));
        // Insert into junction table
        // Inserts all relations at once (efficient).
        // Links archives to the collection.
        await CollectionItem_1.default.bulkCreate(collectionItems);
        // Fetch complete collection with archives
        const completeCollection = await Collection_1.default.findByPk(collection.id);
        // Send success response
        res.status(201).json({
            message: 'Collection created successfully',
            collection: completeCollection,
            collectionItems: collectionItems
        });
    }
    catch (error) {
        console.error('Error creating collection:', error);
        res.status(500).json({ message: 'Error creating a collection...' });
    }
};
exports.createCollectionHandler = createCollectionHandler;
// ================================================
// @desc Delete a collection
// @route DELETE /collections/:id
// @access Private (Admin only)
// ================================================
const deleteCollectionHandler = async (req, res) => {
    try {
        const { id } = req.params;
        // Find the collection
        const collection = await Collection_1.default.findByPk(id);
        if (!collection) {
            res.status(404).json({ message: "Collection not found" });
            return;
        }
        // Delete the collection (CollectionItems should also cascade delete)
        await collection.destroy();
        res.status(200).json({ message: "Collection deleted successfully" });
    }
    catch (error) {
        console.error('Error deleting collection:', error);
        res.status(500).json({ message: 'Error deleting collection...' });
    }
};
exports.deleteCollectionHandler = deleteCollectionHandler;
