import { deleteSimMultiplierById } from '../../models/AdminPanel/admin.model.deleteMultiplyer.js';
import { handelResponse } from '../../utils/errorHandeler.js';


export const deleteSimMultiplier = async (req, res, next) => {
    try {
        const { id } = req.body;
        console.log("delete request ",id)        // Validation
        if (!id) {
            return handelResponse(res, 400, "Multiplier ID is required")
        }

        if (isNaN(id)) {
            return handelResponse(res, 400, "Invalid multiplier ID")
        }

        // Delete operation
        const result = await deleteSimMultiplierById(id);

        if (result.affectedRows === 0) {
            return handelResponse(res, 400, "Multiplier not found")
        }
        return handelResponse(res, 200, "Multiplier deleted successfully")

    } catch (error) {
        console.error("Delete Sim Multiplier Error:", error);
        next(error)
    }
};
