//model + controller
import db from '../../config/db.js'
import { handelResponse } from '../../utils/errorHandeler.js'
export const getMultiplierData = async (req, res, next)=> {
    try {
        const query = `SELECT * FROM sim_price_multipliers`
        
        const [rows] = await db.query(query)
        handelResponse(res,200,"sim multipliers fetched successfully",rows)
    } catch (error) {
        next(error)
    }
}