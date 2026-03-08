import db from "../../config/db.js";

export const isEventProcessed = async (eventId) => {

    const [rows] = await db.query(
        "SELECT id FROM stripe_webhook_events WHERE id = ?",
        [eventId]
    );

    return rows.length > 0;
};

export const storeProcessedEvent = async (eventId) => {

    await db.query(
        "INSERT INTO stripe_webhook_events (id) VALUES (?)",
        [eventId]
    );

};