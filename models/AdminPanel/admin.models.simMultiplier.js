import pool from "../../config/db.js";

export const updateSimMultiplierService = async ({
    sim_type,
    country_code,
    multiplier,
    is_active,
}) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [existing] = await connection.execute(
            `
      SELECT id, multiplier
      FROM sim_price_multipliers
      WHERE sim_type = ?
      AND country_code = ?
      LIMIT 1
      `,
            [sim_type, country_code]
        );

        let response;

        if (existing.length > 0) {
            await connection.execute(
                `
        UPDATE sim_price_multipliers
        SET multiplier = ?, is_active = ?, updated_at = NOW()
        WHERE id = ?
        `,
                [multiplier, is_active, existing[0].id]
            );

            response = {
                action: "updated",
                id: existing[0].id,
                old_multiplier: existing[0].multiplier,
                new_multiplier: multiplier,
            };

        } else {
            const [insertResult] = await connection.execute(
                `
        INSERT INTO sim_price_multipliers
        (sim_type, country_code, multiplier, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
        `,
                [sim_type, country_code, multiplier, is_active]
            );

            response = {
                action: "created",
                id: insertResult.insertId,
                new_multiplier: multiplier,
            };
        }

        await connection.commit();
        return response;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};