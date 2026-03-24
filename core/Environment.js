import dotenv from "dotenv";
import Logger from "./Logger.js";

dotenv.config();

const Environment = {
    PORT: process.env.PORT || 1234,
    AUTH_SECRET_KEY: process.env.AUTH_SECRET_KEY,
    SERVICE_ACCOUNT: process.env.SERVICE_ACCOUNT,
    SPREADSHEET_ID: process.env.SPREADSHEET_ID
}

export default Environment 