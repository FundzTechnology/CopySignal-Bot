import cocobase from "cocobase";
const { Cocobase } = cocobase;
import * as dotenv from "dotenv";
dotenv.config();
export const db = new Cocobase({
    apiKey: process.env.COCOBASE_API_KEY
});
//# sourceMappingURL=cocobase.js.map