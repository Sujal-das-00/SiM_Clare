import IORedis from "ioredis";
import "dotenv/config";
const bullRedis = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
});

export default bullRedis;