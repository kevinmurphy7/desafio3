import express, { query } from "express"
import {manager} from "./productManager.js"

const PORT = 8080
const app= express()

app.get("/products", async (req, res)=>{
    try {
        const results = await manager.getProducts(req.query)
        const info={"count": results.length}
        res.status(200).send({status: "success",info , results})
    } catch (error) {
        res.status(500).send({status: "error", error: error.message})   
    }

})

app.get("/products/:pid", async (req, res)=>{
    const {pid} = req.params
    try {
        const results = await manager.getProductById(pid)
        if (results) {
            res.status(200).send({status: "success", results})   
        }  else {
            res.status(404).send({status: "error", error: "Id "+pid+" not found"})
        }   
    } catch (error) {
        res.status(500).send({status: "error", error: error.message})   
    }
})


app.listen(PORT, ()=>{
    console.log("Escuchando en Puerto "+PORT)
    console.log("localhost:8080/products                      retorna todos los productos \n"+ 
    "localhost:8080/products? limit=n             retorna los primeros n productos.\n"+
    "localhost:8080/products/x                    retorna el producto id x\n"+
    "localhost:8080/products/x1,..,xn             retorna todos los productos con las ids pedidas.")
})