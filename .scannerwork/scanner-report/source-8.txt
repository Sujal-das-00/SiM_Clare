
import db from '../../config/db.js';
import logger from '../../utils/looger.js';

const password_resets = async () => {
    try {
        const query = `CREATE TABLE IF NOT EXISTS user_otps (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    purpose ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET', 'PHONE_VERIFICATION') NOT NULL,
    expires_at DATETIME(3) NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
    CONSTRAINT fk_user_otp
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);
`;
    db.query(query)
    } catch (error) {
        logger.error(error.message)
    }
}

password_resets()