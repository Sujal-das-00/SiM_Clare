
import db from '../../config/db.js';
import logger from '../../utils/looger.js';

const password_resets = async () => {
    try {
        const query = `CREATE TABLE password_resets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(150) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;
    db.query(query)
    } catch (error) {
        logger.error(error.message)
    }
}

password_resets()