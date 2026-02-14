import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const production = process.env.NODE_ENV === "production";

const pool = mysql.createPool({
    host: production ? process.env.DB_HOST : process.env.DEV_DB_HOST,
    user: production ? process.env.DB_USER : process.env.DEV_DB_USER,
    password: production ? process.env.DB_PASSWORD : process.env.DEV_DB_PASSWORD,
    database: production ? process.env.DB_NAME : process.env.DEV_DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        return;
    }
    console.log("Database Connected");
    connection.release();
});

export default pool;
