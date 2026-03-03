import { handelResponse } from "../../utils/errorHandeler.js";
import db from '../../config/db.js'
export const getAllPromoCodes = async (req ,res , next)=>{
    try {
        const query = `SELECT 
    id,
    code,
    discount_type,
    discount_value,
    max_discount,
    min_order_amount,
    usage_limit,
    used_count,
    usage_limit - used_count AS remaining_uses,
    user_usage_limit,
    valid_from,
    valid_until,
    is_first_order_only,
    country_code,
    sim_type,
    CASE
        WHEN valid_until IS NOT NULL AND valid_until < NOW() THEN 'expired'
        WHEN valid_from  IS NOT NULL AND valid_from  > NOW() THEN 'upcoming'
        ELSE 'live'
    END AS status,
    created_at
FROM promo_codes
WHERE is_active = 1
ORDER BY created_at DESC;  `;
const [rows] = await db.query(query)
return handelResponse(res,200,"Promocode fetched Successfully",rows)
    } catch (error) {
        next(error)
    }
}