import db from "../config/db.js";
import { handelResponse } from "../utils/errorHandeler.js";
export const getUserHistory = async (req, res, next) => {
    try {
        const userid = req.user.id;
        const query = `SELECT * FROM user_esim_view where user_id=?`
        const [response] = await db.query(query,[userid])
        return handelResponse(res,200,"data fetched Successfully",response)
    } catch (error) {
        next(error);
    }
}