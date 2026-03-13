import db from '../../config/db.js';

const hasColumn = async (tableName, columnName) => {
    const [rows] = await db.query(
        `
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
        LIMIT 1
        `,
        [tableName, columnName]
    );
    return rows.length > 0;
};

const hasIndex = async (tableName, indexName) => {
    const [rows] = await db.query(
        `
        SELECT 1
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND INDEX_NAME = ?
        LIMIT 1
        `,
        [tableName, indexName]
    );
    return rows.length > 0;
};

const sim_Orders = async () => {
    try {
        const order_tbl = `CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT NOT NULL,
    sim_id VARCHAR(100) NOT NULL,
    country_code VARCHAR(10),
    terms_agreed TINYINT(1) NOT NULL DEFAULT 0,
    sim_type TINYINT,

    base_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    discount_value DECIMAL(10,2) DEFAULT 0,
    final_price DECIMAL(10,2) NOT NULL,

    currency VARCHAR(10) DEFAULT 'CAD',
    promo_code VARCHAR(50),
    checkout_attempt_id VARCHAR(64),

    order_status ENUM(
        'CREATED',
        'PAYMENT_PENDING',
        'PAID',
        'PROVISIONING',
        'COMPLETED',
        'AWAITING_BALANCE',
        'FAILED',
        'REFUNDED'
    ) DEFAULT 'CREATED',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),

    INDEX idx_user(user_id),
    INDEX idx_user_attempt(user_id, checkout_attempt_id),
    INDEX idx_status(order_status),
    INDEX idx_created(created_at)
);
`;
const payments = `CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    order_id BIGINT NOT NULL,

    stripe_payment_intent_id VARCHAR(255),
    stripe_sessionId VARCHAR(255),

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
    INDEX idx_payment_intent(stripe_payment_intent_id),
    INDEX idx_session_id(stripe_sessionId)
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
const Stripe = `CREATE TABLE IF NOT EXISTS  stripe_webhook_events (
    id VARCHAR(255) PRIMARY KEY,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`

const order_Provisioning = `CREATE TABLE IF NOT EXISTS order_provisioning (
    
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    order_id BIGINT NOT NULL,
    sim_type TINYINT NOT NULL,

    -- TYPE 1
    mobile_no VARCHAR(20),

    -- TYPE 4
    msisdn VARCHAR(20),
    product_code VARCHAR(100),
    product_type VARCHAR(50),

    -- Common
    email VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Foreign key
    CONSTRAINT fk_order_provisioning_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    INDEX idx_order_id (order_id),
    INDEX idx_sim_type (sim_type)

);`;

const esim_history = `CREATE TABLE esim_purchase_history (

    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    -- internal system references
    order_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,

    -- provider identifiers
    provider_purchase_id VARCHAR(100),
    provider_reference VARCHAR(100),
    provider_client_id VARCHAR(50),

    -- product information
    sku VARCHAR(100) NOT NULL,
    product_type INT,
    quantity INT DEFAULT 1,

    -- eSIM credentials
    activation_code TEXT,
    iccid VARCHAR(25),
    msisdn VARCHAR(20),
    nsce VARCHAR(50),
    pin_code VARCHAR(20),
    puk VARCHAR(50),
    smdp_url VARCHAR(255),

    -- financial details
    provider_currency VARCHAR(10) DEFAULT 'USD',
    provider_amount DECIMAL(10,2),
    provider_billed_amount DECIMAL(10,2),
    provider_balance_after DECIMAL(10,2),

    -- provider response status
    provider_status_code INT,
    provider_status_msg VARCHAR(255),
    provider_status_desc VARCHAR(255),

    -- provider timestamps
    provider_txn_time DATETIME,

    -- provider user data
    provider_mobile VARCHAR(30),
    provider_email VARCHAR(255),

    -- internal lifecycle tracking
    provisioning_status ENUM(
        'INITIATED',
        'REQUEST_SENT',
        'QUEUED',
        'PURCHASED',
        'ACTIVATED',
        'FAILED'
    ) DEFAULT 'INITIATED',

    retry_count INT DEFAULT 0,

    -- full provider response
    raw_response JSON,

    -- auditing
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- indexes
    INDEX idx_order_id (order_id),
    INDEX idx_user_id (user_id),
    INDEX idx_provider_purchase_id (provider_purchase_id),
    INDEX idx_iccid (iccid),
    INDEX idx_msisdn (msisdn)

);`;

const Userviews = `CREATE VIEW user_esim_view AS
SELECT
    id,
    order_id,
    user_id,

    -- provider identifiers visible to user
    provider_purchase_id,
    provider_reference,

    -- product info
    sku,
    product_type,
    quantity,

    -- esim credentials
    iccid,
    activation_code,
    msisdn,

    -- status info
    provisioning_status,
    provider_txn_time,

    created_at
FROM esim_purchase_history;`

        await db.query(order_tbl);
        await db.query(payments);
        await db.query(sim_history);
        await db.query(Stripe);
        await db.query(order_Provisioning)
        await db.query(esim_history)
        await db.query(Userviews)
        console.log("tables created");

        // ---- Existing DB migrations (idempotent) ----
        // orders.checkout_attempt_id
        if (!(await hasColumn("orders", "checkout_attempt_id"))) {
            await db.query(
                `ALTER TABLE orders ADD COLUMN checkout_attempt_id VARCHAR(64) NULL`
            );
            console.log("Migration: added orders.checkout_attempt_id");
        }

        // payments.stripe_sessionId rename from legacy stripe_client_secret
        const hasStripeSessionId = await hasColumn("payments", "stripe_sessionId");
        const hasLegacyClientSecret = await hasColumn("payments", "stripe_client_secret");

        if (!hasStripeSessionId && hasLegacyClientSecret) {
            await db.query(
                `ALTER TABLE payments CHANGE COLUMN stripe_client_secret stripe_sessionId VARCHAR(255)`
            );
            console.log("Migration: renamed payments.stripe_client_secret -> stripe_sessionId");
        } else if (!hasStripeSessionId && !hasLegacyClientSecret) {
            await db.query(
                `ALTER TABLE payments ADD COLUMN stripe_sessionId VARCHAR(255) NULL`
            );
            console.log("Migration: added payments.stripe_sessionId");
        }

        // indexes
        if (!(await hasIndex("orders", "idx_user_attempt"))) {
            await db.query(
                `CREATE INDEX idx_user_attempt ON orders(user_id, checkout_attempt_id)`
            );
            console.log("Migration: created index idx_user_attempt");
        }

        if (!(await hasIndex("payments", "idx_session_id"))) {
            await db.query(
                `CREATE INDEX idx_session_id ON payments(stripe_sessionId)`
            );
            console.log("Migration: created index idx_session_id");
        }

        const orderProvisioningColumnsToDrop = [
            "destination_id",
            "customer_name",
            "customer_surname1",
            "customer_surname2",
            "customer_document_type_id",
            "customer_document_number",
            "customer_birthdate",
            "customer_sex",
            "customer_nationality_id"
        ];

        for (const columnName of orderProvisioningColumnsToDrop) {
            if (await hasColumn("order_provisioning", columnName)) {
                await db.query(
                    `ALTER TABLE order_provisioning DROP COLUMN ${columnName}`
                );
                console.log(`Migration: dropped order_provisioning.${columnName}`);
            }
        }

        console.log("schema migration complete");
    } catch (error) {
        console.log(error.message);
    }
}
sim_Orders();
