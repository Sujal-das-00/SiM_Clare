import db from '../../config/db.js';

const sim_Orders = async () => {
    try {
        const order_tbl = `CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT NOT NULL,
    sim_id VARCHAR(100) NOT NULL,
    country_code VARCHAR(10),

    sim_type TINYINT,

    base_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    discount_value DECIMAL(10,2) DEFAULT 0,
    final_price DECIMAL(10,2) NOT NULL,

    currency VARCHAR(10) DEFAULT 'CAD',
    promo_code VARCHAR(50),

    order_status ENUM(
        'CREATED',
        'PAYMENT_PENDING',
        'PAID',
        'PROVISIONING',
        'COMPLETED',
        'FAILED',
        'REFUNDED'
    ) DEFAULT 'CREATED',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),

    INDEX idx_user(user_id),
    INDEX idx_status(order_status),
    INDEX idx_created(created_at)
);
`;
const payments = `CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    order_id BIGINT NOT NULL,

    stripe_payment_intent_id VARCHAR(255),
    stripe_client_secret VARCHAR(255),

    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'CAD',

    payment_status ENUM(
        'CREATED',
        'REQUIRES_PAYMENT',
        'SUCCEEDED',
        'FAILED',
        'REFUNDED'
    ) DEFAULT 'CREATED',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(id),

    INDEX idx_order(order_id),
    INDEX idx_payment_intent(stripe_payment_intent_id)
);`;

const sim_history = `CREATE TABLE IF NOT EXISTS sim_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    order_id BIGINT NOT NULL,

    sim_sku VARCHAR(50),
    provider_order_id VARCHAR(100),

    iccid VARCHAR(50),
    msisdn VARCHAR(50),

    activation_code VARCHAR(255),
    qr_code TEXT,

    provisioning_status ENUM(
        'PENDING',
        'SUCCESS',
        'FAILED'
    ) DEFAULT 'PENDING',

    provider_response JSON,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (order_id) REFERENCES orders(id),

    INDEX idx_order(order_id)
);`

        await db.query(order_tbl);
        await db.query(payments);
        await db.query(sim_history);
        console.log("tables created")
    } catch (error) {
        console.log(error.message);
    }
}
sim_Orders();