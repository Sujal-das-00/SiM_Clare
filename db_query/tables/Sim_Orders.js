import db from '../../config/db.js';

const sim_Orders = async()=>{
    try {
        const query = `CREATE TABLE sim_orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    provider_order_id_hashed VARCHAR(100) NOT NULL,
    order_status ENUM(
        'PENDING',
        'SUCCESS',
        'FAILED',
        'REFUNDED'
    ) NOT NULL,
    total_amount DECIMAL(10,2),
    currency VARCHAR(10) DEFAULT 'USD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
`;
        const [rows] = db.query(query);
    } catch (error) {
        console.log(error.message);
    }
}
sim_Orders();