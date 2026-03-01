import db from '../../config/db.js' 

/**
 * Delete Sim Multiplier by ID
 * @param {number} id
 * @returns {Promise}
 */
export const deleteSimMultiplierById = async (id) => {
    const query = `
        DELETE FROM sim_price_multipliers
        WHERE id = ?
    `;

    const [result] = await db.execute(query, [id]);
    return result;
};

