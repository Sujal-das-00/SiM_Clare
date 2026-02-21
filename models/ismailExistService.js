import db from '../config/db.js'
export const ismailExistService = async(email)=>{
    try {
        const [rows] = await db.query("Select id from users where email=?",[email])
        if(rows.length === 0) return false;
        return({status:true,user_id:rows[0].id,name:rows[0].full_name})
    } catch (error) {
        throw error;
    }
}