"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCollectionHandler = exports.updateCollectionHandler = exports.getCollectionByIdHandler = exports.getAllCollectionsHandler = exports.createCollectionHandler = void 0;
const Archive_1 = __importDefault(require("../models/Archive"));
const Collection_1 = __importDefault(require("../models/Collection"));
const CollectionItem_1 = __importDefault(require("../models/CollectionItem"));
// import { sequelize } from "../db";
const db_1 = __importDefault(require("../db"));
const cache_1 = __importDefault(require("../utils/cache"));
const cache_2 = require("../utils/cache");
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
        // Clear all collections-related cache keys
        (0, cache_2.clearCollectionsCache)();
    }
    catch (error) {
        console.error('Error creating collection:', error);
        res.status(500).json({ message: 'Error creating a collection...' });
    }
};
exports.createCollectionHandler = createCollectionHandler;
// ================================================
// @desc Get all collections with their archives count
// @route GET /collections
// @access Public
// ================================================
// export const getAllCollectionsHandler = async (req: Request, res: Response) => {
//     try {
//         const { search } = req.query;
//         let whereClause = {};
//         if (search && typeof search === "string") {
//             whereClause = {
//                 [Op.or]: [
//                     { name: { [Op.iLike]: `%${search}%` } },
//                     { description: { [Op.iLike]: `%${search}%` } }
//                 ]
//             };
//         }
//         const collections = await Collection.findAll({
//             where: whereClause,
//         });
//         res.status(200).json({
//             message: 'Collections retrieved successfully',
//             count: collections.length,
//             collections
//             // count: collectionsWithCount.length,
// //   collections: collectionsWithCount
//         });
//     } catch (error) {
//         console.error('Error fetching collections:', error);
//         res.status(500).json({ message: 'Error fetching collections...' });
//     }
// }
const getAllCollectionsHandler = async (req, res) => {
    try {
        const { search } = req.query;
        const cacheKey = `collections:${search || 'none'}`;
        // Check cache
        const cachedData = cache_1.default.get(cacheKey);
        if (cachedData) {
            console.log(`[CACHE HIT] Key: ${cacheKey}`);
            return res.status(200).json(cachedData);
        }
        console.log(`[CACHE MISS] Key: ${cacheKey} | Querying DB...`);
        let searchCondition = '';
        if (search && typeof search === "string") {
            searchCondition = `WHERE c.name ILIKE '%${search}%' OR c.description ILIKE '%${search}%'`;
        }
        const [collections] = await db_1.default.query(`
            SELECT 
                c.*,
                COUNT(ci."ArchiveId") as "itemCount"
            FROM "Collections" c
            LEFT JOIN "CollectionItems" ci ON c.id = ci."CollectionId"
            ${searchCondition}
            GROUP BY c.id
            ORDER BY c."createdAt" DESC
        `);
        const response = {
            message: 'Collections retrieved successfully',
            count: collections.length,
            collections
        };
        // Cache the entire response
        cache_1.default.set(cacheKey, response);
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ message: 'Error fetching collections...' });
    }
};
exports.getAllCollectionsHandler = getAllCollectionsHandler;
// real
// ================================================
// @desc Get a single collection by ID with its archive items
// @route GET /collections/:id
// @access Public
// ================================================
// export const getCollectionByIdHandler = async (req: Request, res: Response) => {
//     try {
//         const collectionId = req.params.id;
//         const collection = await Collection.findByPk(collectionId);
//         if (!collection) {
//             res.status(404).json({ message: "Collection not found" });
//             return;
//         }
//         res.status(200).json({
//             message: 'Collection retrieved successfully',
//             collection
//         });
//     } catch (error) {
//         console.error('Error fetching collection:', error);
//         res.status(500).json({ message: 'Error fetching collection...' });
//     }
// }
// export const getCollectionByIdHandler = async (req: Request, res: Response) => {
//   try {
//     const collectionId = req.params.id;
//     const collection = await Collection.findByPk(collectionId, {
//       include: [
//         {
//           model: Archive,
//           as: 'Archives', // Must match the alias in belongsToMany
//           through: { attributes: [] }, // Don't need junction table data
//           attributes: ['id', 'title', 'description', 'mediaType', 'cloudServiceUrl', 'createdAt']
//         }
//       ]
//     });
//     if (!collection) {
//       return res.status(404).json({ message: "Collection not found" });
//     }
//     // Convert to plain object (removes Sequelize metadata)
//     const plainCollection = collection.get({ plain: true }) as any;
//     res.status(200).json({
//       message: 'Collection retrieved successfully',
//       collection: {
//         ...plainCollection,
//         items: plainCollection.Archives || [] // This is what your frontend expects
//       }
//     });
// console.log("Backend returned items:", collection.items);
//   } catch (error) {
//     console.error('Error fetching collection:', error);
//     res.status(500).json({ message: 'Error fetching collection...' });
//   }
// };
const getCollectionByIdHandler = async (req, res) => {
    var _a;
    try {
        const collectionId = req.params.id;
        const cacheKey = `collection:${collectionId}`;
        const cachedData = cache_1.default.get(cacheKey);
        if (cachedData) {
            console.log(`[CACHE HIT] Key: ${cacheKey}`);
            return res.status(200).json(cachedData);
        }
        console.log(`[CACHE MISS] Key: ${cacheKey} | Querying DB...`);
        const collection = await Collection_1.default.findByPk(collectionId, {
            include: [
                {
                    model: Archive_1.default,
                    as: 'Archives', // your alias
                    through: { attributes: [] },
                    attributes: ['id', 'title', 'description', 'mediaType', 'cloudServiceUrl', 'createdAt']
                }
            ]
        });
        if (!collection) {
            return res.status(404).json({ message: "Collection not found" });
        }
        // Convert to plain object
        const plainCollection = collection.get({ plain: true });
        // Rename "Archives" to "items" so frontend gets what it expects
        const responseData = {
            ...plainCollection,
            items: plainCollection.Archives || [] // ← key change!
        };
        // Log AFTER renaming — should now show the array
        console.log("Backend returned items:", responseData.items);
        // Optional: more detailed log
        console.log("Full collection response:", {
            id: responseData.id,
            name: responseData.name,
            itemCount: responseData.items.length,
            firstItemId: ((_a = responseData.items[0]) === null || _a === void 0 ? void 0 : _a.id) || 'none'
        });
        // Prepare response object
        const response = {
            message: 'Collection retrieved successfully',
            collection: responseData // ← send the renamed version
        };
        // Cache the entire response
        cache_1.default.set(cacheKey, response);
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error fetching collection:', error);
        res.status(500).json({ message: 'Error fetching collection...' });
    }
};
exports.getCollectionByIdHandler = getCollectionByIdHandler;
// ================================================
// @desc Edit/Update a collection
// @route PUT /collections/edit/:id
// @access Private (Admin only)
// ================================================
// export const updateCollectionHandler = async (req: Request, res: Response) => {
//     try {
//         const { id } = req.params;
//         const { name, description } = req.body;
//         // Find the collection
//         const collection = await Collection.findByPk(id);
//         if (!collection) {
//             return res.status(404).json({ message: 'Collection not found' });
//         }
//         // If changing name, check if new name already exists
//         if (name && name.trim() !== collection.name) {
//             const existingCollection = await Collection.findOne({
//                 where: { name: name.trim() }
//             });
//             if (existingCollection) {
//                 return res.status(400).json({ message: 'Collection name already exists' });
//             }
//         }
//         // Update the collection
//         await collection.update({
//             name: name.trim(),
//             description: description.trim()
//         });
//         res.status(200).json({
//             message: 'Collection updated successfully',
//             collection
//         });
//     } catch (error) {
//         console.error('Error updating collection:', error);
//         res.status(500).json({ message: 'Error updating collection...' });
//     }
// }
const updateCollectionHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, addItemIds = [], removeItemIds = [] } = req.body;
        const collection = await Collection_1.default.findByPk(id);
        if (!collection) {
            return res.status(404).json({ message: 'Collection not found' });
        }
        // Update name/description if provided
        if (name)
            collection.name = name.trim();
        if (description !== undefined)
            collection.description = description.trim();
        await collection.save();
        // Handle item associations (many-to-many)
        if (addItemIds.length > 0) {
            const archives = await Archive_1.default.findAll({ where: { id: addItemIds } });
            await collection.addArchives(archives);
        }
        if (removeItemIds.length > 0) {
            await collection.removeArchives(removeItemIds);
        }
        // Reload with updated associations
        const updatedCollection = await Collection_1.default.findByPk(id, {
            include: [{ model: Archive_1.default, as: 'Archives' }],
        });
        res.status(200).json({
            message: 'Collection updated successfully',
            collection: updatedCollection,
        });
        // Clear all collections-related cache keys
        (0, cache_2.clearCollectionsCache)();
        console.log("Received payload:", req.body);
        console.log("addItemIds:", addItemIds);
        console.log("removeItemIds:", removeItemIds);
    }
    catch (error) {
        console.error('Error updating collection:', error);
        res.status(500).json({ message: 'Error updating collection...' });
    }
};
exports.updateCollectionHandler = updateCollectionHandler;
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
        // Clear all collections-related cache keys
        (0, cache_2.clearCollectionsCache)();
    }
    catch (error) {
        console.error('Error deleting collection:', error);
        res.status(500).json({ message: 'Error deleting collection...' });
    }
};
exports.deleteCollectionHandler = deleteCollectionHandler;
