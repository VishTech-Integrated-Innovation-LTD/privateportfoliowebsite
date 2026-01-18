import { Request, Response } from 'express';
import Archive from '../models/Archive';
import Collection from '../models/Collection';
import CollectionItem from '../models/CollectionItem';
import { Op } from 'sequelize';
// import { sequelize } from "../db";
import sequelize  from "../db";
import cache from '../utils/cache';


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


export const getAllCollectionsHandler = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const cacheKey = `collections:${search || 'none'}`;

        // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`[CACHE HIT] Key: ${cacheKey}`);
            return res.status(200).json(cachedData);
        }

    console.log(`[CACHE MISS] Key: ${cacheKey} | Querying DB...`);

        let searchCondition = '';
        if (search && typeof search === "string") {
            searchCondition = `WHERE c.name ILIKE '%${search}%' OR c.description ILIKE '%${search}%'`;
        }

        const [collections] = await sequelize.query(`
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
    cache.set(cacheKey, response);

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ message: 'Error fetching collections...' });
    }
}



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



export const getCollectionByIdHandler = async (req: Request, res: Response) => {
  try {
    const collectionId = req.params.id;
    const cacheKey = `collection:${collectionId}`;

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log(`[CACHE HIT] Key: ${cacheKey}`);
            return res.status(200).json(cachedData);
        }

    console.log(`[CACHE MISS] Key: ${cacheKey} | Querying DB...`);

    const collection = await Collection.findByPk(collectionId, {
      include: [
        {
          model: Archive,
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
    const plainCollection = collection.get({ plain: true }) as any;

    // Rename "Archives" to "items" so frontend gets what it expects
    const responseData = {
      ...plainCollection,
      items: plainCollection.Archives || []   // ← key change!
    };

    // Log AFTER renaming — should now show the array
    console.log("Backend returned items:", responseData.items);

    // Optional: more detailed log
    console.log("Full collection response:", {
      id: responseData.id,
      name: responseData.name,
      itemCount: responseData.items.length,
      firstItemId: responseData.items[0]?.id || 'none'
    });

    // Prepare response object
    const response = {
      message: 'Collection retrieved successfully',
      collection: responseData   // ← send the renamed version
    }

     // Cache the entire response
    cache.set(cacheKey, response);

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ message: 'Error fetching collection...' });
  }
};



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

export const updateCollectionHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, addItemIds = [], removeItemIds = [] } = req.body;

    const collection = await Collection.findByPk(id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }

    // Update name/description if provided
    if (name) collection.name = name.trim();
    if (description !== undefined) collection.description = description.trim();

    await collection.save();

    // Handle item associations (many-to-many)
    if (addItemIds.length > 0) {
      const archives = await Archive.findAll({ where: { id: addItemIds } });
      await collection.addArchives(archives);
    }

    if (removeItemIds.length > 0) {
      await collection.removeArchives(removeItemIds);
    }

    // Reload with updated associations
    const updatedCollection = await Collection.findByPk(id, {
      include: [{ model: Archive, as: 'Archives' }],
    });

    res.status(200).json({
      message: 'Collection updated successfully',
      collection: updatedCollection,
    });

    console.log("Received payload:", req.body);
console.log("addItemIds:", addItemIds);
console.log("removeItemIds:", removeItemIds);

  } catch (error) {
    console.error('Error updating collection:', error);
    res.status(500).json({ message: 'Error updating collection...' });
  }
};


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
