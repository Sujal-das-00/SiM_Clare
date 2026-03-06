import { redisClient } from "../../config/Redish_connection.js";
const data = await redisClient.get("esim:JYN-1:featured");
// const plans = JSON.parse(data);

const plan = data.find(p => p.id === "eSIM-JP500M-01");

console.log(plan);