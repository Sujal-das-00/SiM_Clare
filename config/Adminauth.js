import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

let cachedToken = null;
let tokenExpiry = null;
let cachedEnv = null;
const GetAdminJwt = async () => {
    const currentEnv = process.env.NODE_ENV === "production"
        ? "production"
        : "development";
    const baseURL =
        currentEnv === "production"
            ? process.env.PROD_URL
            : process.env.UAT_URL;

    const password =
        currentEnv === "production"
            ? process.env.PROD_PASSWORD
            : process.env.UAT_PASSWORD;

    // console.log("Enviroment is ", currentEnv)
    // console.log("url",process.env.PROD_URL+'esim/authenticate')
    // console.log("password",process.env.PROD_PASSWORD)
    try {

        if (cachedEnv && cachedEnv !== currentEnv) {
            cachedToken = null;
            tokenExpiry = null;
        }

        if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 60000) {
            return cachedToken;
        }



        const response = await axios.post(
            `${baseURL}esim/authenticate`,
            {
                userName: process.env.API_USERNAME,
                password: password
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.data?.token) {
            throw new Error("Authentication failed: No token returned");
        }

        cachedToken = response.data.token;
        tokenExpiry = Date.now() + (15 * 60 * 1000);
        console.log("Enviroment is : ", currentEnv)
        return cachedToken;

    } catch (error) {
        console.error("JWT Error:", error.response?.data || error.message);
        throw error;
    }
};


export default GetAdminJwt;