import { Request, Response } from 'express';



// ================================================
// @desc Create a collection
// @route POST /collections/create
// @access Private (Admin only)
// ================================================
export const createCollectionHandler = async (req: Request, res: Response) => {
    try {
        const { name, description, ArchiveId } = req.body;
 } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating a collection...' });
    }
}
