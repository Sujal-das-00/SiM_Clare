import db from '../../config/db.js';

const createSimPriceMultiplierTable = async () => {
    try {
        const query = `
            CREATE TABLE IF NOT EXISTS sim_price_multipliers (
    id INT AUTO_INCREMENT PRIMARY KEY,

    sim_type VARCHAR(20) NOT NULL,
    country_code VARCHAR(50) NOT NULL DEFAULT 'GLOBAL',

    multiplier DECIMAL(8,4) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT multiplier_positive CHECK (multiplier > 0),
    CONSTRAINT multiplier_reasonable CHECK (multiplier <= 20),

    CONSTRAINT unique_sim_country UNIQUE (sim_type, country_code)
);
        `;

        await db.query(query);

        console.log("sim_price_multipliers table created");

    } catch (error) {
        console.error(" Error creating sim_price_multipliers table:", error);
    }
};

createSimPriceMultiplierTable();