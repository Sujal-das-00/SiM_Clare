import dotenv from 'dotenv'
import axios from 'axios';
dotenv.config()
let expiredToken = null;
let cachedToken = null;
const isDev = true;
const GetAdminJwt = async () => {
    try {
        if (cachedToken && Date.now() < expiredToken) {
            return cachedToken
        }
        if (isDev) {
            const response = await axios.post(process.env.UAT_URL + 'esim/authenticate',
                {
                    userName: process.env.API_USERNAME,
                    password: process.env.UAT_PASSWORD

                }, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
        } else if (!isDev) {
            const response = await axios.post(process.env.PROD_URL + 'esim/authenticate',
                {
                    userName: process.env.API_USERNAME,
                    password: process.env.PROD_PASSWORD

                }, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
        }
        expiredToken = Date.now() + (15 * 60 * 1000)//15 mins expire
        cachedToken = response.data.token;
        return cachedToken;

    } catch (error) {
        console.error("JWT Error:", error.response?.data || error.message);
        throw error;
    }

}
export default GetAdminJwt;