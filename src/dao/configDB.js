import mongoose from "mongoose";
import envKeys from "../config/configEnv.js";

mongoose
    .connect(envKeys.mongo_uri)
    .then( () => console.log("Connected to DB") )
    .catch( error => console.log(error) )