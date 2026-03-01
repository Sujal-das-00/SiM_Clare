import db from '../../config/db.js'
async function promocodeTable() {
    try {
        const promocode = `CREATE TABLE promo_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        discount_type ENUM('percentage','flat') NOT NULL,
        discount_value DECIMAL(10,2) NOT NULL,
        max_discount DECIMAL(10,2) DEFAULT NULL,
        min_order_amount DECIMAL(10,2) DEFAULT 0,
        usage_limit INT DEFAULT NULL,
        used_count INT DEFAULT 0,
        user_usage_limit INT DEFAULT 1,
        valid_from DATETIME,
        valid_until DATETIME,
        is_first_order_only BOOLEAN DEFAULT FALSE,
        country_code VARCHAR(10) DEFAULT NULL,
        sim_type INT DEFAULT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`;
        const promocodeController = `CREATE TABLE promo_redemptions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    promo_id INT NOT NULL,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_promo_order (promo_id, user_id, order_id),
    FOREIGN KEY (promo_id) REFERENCES promo_codes(id)
);`;
        await db.query(promocode);
        await db.query(promocodeController)
    } catch (error) {

    }
}