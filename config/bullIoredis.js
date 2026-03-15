/*initially the architecture was diffrent and having the bull redis connected with unstash
so all the variable is construced in name of bull redis as it uses the bullMq so a quick real fix
it must work :)
*/

import { createRedisClient } from "./Redish_connection.js";

export const bullRedis = createRedisClient()