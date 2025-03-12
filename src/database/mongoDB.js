import mongoose from "mongoose";
import config from '../config/config.js';

mongoose.set("strictQuery", false);
mongoose.connect(config.MONGODB_URI);
const con = mongoose.connection;

export default con;
