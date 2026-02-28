import {UAParser} from "ua-parser-js";

export const parseUserAgent = (userAgent) => {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    return {
        model: result.device.model,
        os: result.os.name,
        osVersion: result.os.version
    };
};