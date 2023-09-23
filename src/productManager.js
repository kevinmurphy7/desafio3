import fs from "fs"
const path = "productos.json"

class ProductManager {

    static productCount = 0

    static nuevoId (){
        return ProductManager.productCount+=1
    }

    constructor(path) {
        this.path=path
        this.products = []
        this.lastProductId=0
    }
    


    async retreiveProducts() {
        let products = []
        if (fs.existsSync(this.path)){
            const content = await fs.promises.readFile(this.path)
            products = JSON.parse(content)
        } else {
        }
        this.lastProductId = products.length ? products[products.length-1].id : 0
        return products
    }


    async saveProducts(products) {
        const content = JSON.stringify(products);
        fs.promises.writeFile(this.path, content);
    }

    async addProduct(prodToAdd) {
        this.products = await this.retreiveProducts();
        if (this.validProduct(prodToAdd)) {
            let newProduct = prodToAdd
            newProduct.id =  ProductManager.nuevoId()
            this.products.push(newProduct)
            await this.saveProducts(this.products)
            console.log("El codigo ",newProduct.code," fue agregado exitosamente.");
        }
    }

    validProduct(prodToVerify) {
        let returnValue= true
        let logMessage= "Se han encontrado los siguientes errores: \n"
        const codeExist= this.products.find(prod => prod.code ==prodToVerify.code);
        if (!(codeExist===undefined)) {
            logMessage+= "- El codigo "+prodToVerify.code+" ya existe.\n"
            returnValue=false
        }
        if (!prodToVerify.title) {
            logMessage+= "- No ha especificado el titulo (title) del producto.\n"
            returnValue=false
        }
        if (!prodToVerify.description) {
            logMessage+= "- No ha especificado la descripcion (description) del producto.\n"
            returnValue=false
        }
        if (!prodToVerify.thumbnail) {
            logMessage+= "- No ha especificado el archivo de imagen (thumbnail) del producto.\n"
            returnValue=false
        }
        if (!prodToVerify.code) {
            logMessage+= "- No ha especificado el código (code) del producto.\n"
            returnValue=false
        }
        if (prodToVerify.price===undefined) {
            logMessage+= "- No ha especificado el precio (price) del producto.\n"
            returnValue=false
        }
        if (prodToVerify.stock===undefined) {
            logMessage+= "- No ha especificado el stock del producto.\n"
            returnValue=false
        }
        returnValue || console.log(logMessage)
        return returnValue
    }

    async getProductById(id) {
        this.products = await this.retreiveProducts();
        const idArray= id.split(",")
        if (idArray.length==1) {
            const searchedCode = this.products.find(prod => prod.id ==id)
            return searchedCode
        }else {
            const prodArray= idArray.map( id => {
                const searchedCode = this.products.find(prod => prod.id ==id)
                
                return searchedCode? searchedCode : { id:  +id, error: "Id "+id+" not found"}
            } )
            return prodArray 
        }
    }

    async getProducts(queryObj) {
        const {limit} = queryObj
        this.products = await this.retreiveProducts();
        return this.products.slice(0, limit)
    }
}

export const manager = new ProductManager(path)