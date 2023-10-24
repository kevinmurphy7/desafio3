import mongoose from "mongoose";

const URI = "mongodb+srv://kevinmurphy:Chukaesta7@cluster0.zee7fdw.mongodb.net/ecommerce?retryWrites=true&w=majority"
mongoose
    .connect(URI)
    .then( () => console.log("Connected to DB") )
    .catch( error => console.log(error) )