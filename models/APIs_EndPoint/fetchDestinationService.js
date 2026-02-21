import axios from "axios";
import logger from "../../utils/looger.js";

export const fetchDestinationService = async (token) => {
    try {
        const isDev = process.env.NODE_ENV !== "production";
        console.log("Enviroment is",isDev);
        const baseURL = isDev
            ? process.env.UAT_URL
            : process.env.PROD_URL;

        const response = await axios.get(
            `${baseURL}esim/destinations`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }
        )
        console.log(response.data)
        return response.data
    } catch (error) {
        logger.error(error)
       throw error;
    }
}