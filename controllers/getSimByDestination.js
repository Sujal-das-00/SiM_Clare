import GetAdminJwt from "../config/Adminauth.js";
import { getSimByDestinationService } from "../models/APIs_EndPoint/getSimByDestinationService.js";
import { handelResponse } from "../utils/errorHandeler.js";

export const getSimByDestination = async (req, res, next) => {
    try {
        const { destinationid } = req.params;
        console.log("this is a query parameter ",destinationid)
        if (!destinationid) return handelResponse(res, 404, "Please select a country");
        const token = await GetAdminJwt();
        //  "call the orchestor it will accept the token and save it to the redish and then return the categories data from the redish"
        const simData = await getSimByDestinationService(token, destinationid)
        return handelResponse(res, 200, "Sim details fetched sucessfully",simData)
    } catch (error) {
        next(error)
    }
}