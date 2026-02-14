import db from '../../config/db.js';

const userSessions = async () => {
    try {
        const query = `CREATE TABLE user_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
    );`;
    const [rows] = db.query(query);

    } catch (error) {
        console.log(error.message)
    }
}
userSessions();