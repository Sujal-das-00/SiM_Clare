import purchaseWorker from "../utils/Queues/purchaseOrderWorker.js";

const shutdown = async (signal) => {
    console.log(`Received ${signal}. Closing purchase worker...`);
    await purchaseWorker.close();
    process.exit(0);
};

process.on("SIGINT", () => {
    shutdown("SIGINT").catch((error) => {
        console.error("Failed to close purchase worker cleanly:", error);
        process.exit(1);
    });
});

process.on("SIGTERM", () => {
    shutdown("SIGTERM").catch((error) => {
        console.error("Failed to close purchase worker cleanly:", error);
        process.exit(1);
    });
});

purchaseWorker.run().catch((error) => {
    console.error("Purchase worker failed to start:", error);
    process.exit(1);
});

console.log("Purchase worker is starting");
