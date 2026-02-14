import db from '../../config/db.js';

const createUserTable = async () => {
    try {
        const query = `
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(20),

    password_hash VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN', 'SUPPORT') DEFAULT 'USER',
    is_active BOOLEAN DEFAULT TRUE,

    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    otp_hash VARCHAR(255),
    otp_expiry DATETIME;
    last_login_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`;

    const [rows] =  db.query(query)
    } catch (error) {
        console.log(error.message);
        
    }
}
createUserTable();