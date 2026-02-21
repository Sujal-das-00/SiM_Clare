import GetAdminJwt from "../config/Adminauth.js"
import { fetchDestinationService } from "../models/APIs_EndPoint/fetchDestinationService.js";
import { handelResponse } from "../utils/errorHandeler.js"

export const fetchDestination = async (req, res, next) => {
    try {
        const token = await GetAdminJwt()
        const destination = await fetchDestinationService(token);
        TODO:
        "saves in redish"
        TODO:"calls the function that only return the sim categoy"
        handelResponse(res,200,"destination fetched successfully",destination)
    } catch (error) {
        next(error)
    }
}