import { Cocobase } from "cocobase";
import * as dotenv from "dotenv";
dotenv.config();

export const db = new Cocobase({
  apiKey: process.env.COCOBASE_API_KEY!
});
