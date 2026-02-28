import pool from "../config/db.js"

export const findExactMatch = async (model, os, osVersion) => {
    const [rows] = await pool.query(
        `SELECT dv.id AS variant_id,
            df.family_name,
            df.esim_supported,
            b.name AS brand
        FROM device_variants dv
        JOIN device_families df ON dv.family_id = df.id
        JOIN brands b ON df.brand_id = b.id
        WHERE dv.model_code = ?
        AND dv.match_type = 'exact'
        AND dv.os = ?
        AND dv.min_os_version <= ?
        AND dv.active = TRUE
        LIMIT 1`,
        [model, os, osVersion]
    );

    return rows[0] || null;
};

export const findPrefixMatch = async (model, os, osVersion) => {
    const [rows] = await pool.query(
        `SELECT dv.id AS variant_id,
        df.family_name,
        df.esim_supported,
        b.name AS brand
        FROM device_variants dv
        JOIN device_families df ON dv.family_id = df.id
        JOIN brands b ON df.brand_id = b.id
        WHERE ? LIKE CONCAT(dv.model_code, '%')
        AND dv.match_type = 'prefix'
        AND dv.os = ?
        AND dv.min_os_version <= ?
        AND dv.active = TRUE
        LIMIT 1`,
        [model, os, osVersion]
    );

    return rows[0] || null;
};

export const getCountryOverride = async (variantId, country) => {
    if (!country) return null;

    const [rows] = await pool.query(
        `SELECT esim_enabled
        FROM compatibility_rules
        WHERE variant_id = ?
        AND country_code = ?
        AND active = TRUE
        LIMIT 1`,
        [variantId, country]
    );

    return rows[0] || null;
};

export const logDetection = async ({
    userAgent,
    detectedModel,
    detectedOs,
    compatible,
    confidence,
    detectionMethod
}) => {

    await pool.query(
        `INSERT INTO detection_logs
        (user_agent, detected_model, detected_os, compatible, confidence, detection_method)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            userAgent,
            detectedModel,
            detectedOs,
            compatible,
            confidence,
            detectionMethod
        ]
    );
};