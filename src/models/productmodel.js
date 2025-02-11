import mongoose from '../common/db.connect.js'

const ProductPcsSchema = new mongoose.Schema({
    productName:{
        type:String,
        required:true
    },
    productCode:{
        type:String,
        required:true,
        unique:true
    },
   
    productType:{
        type: String,
        required:true
    },
    productBarCode:{
        type:String,
        default:null
    },
    createBy:{
        type:String,
        required:true
    },
    productPrice:{
        type:String,
        required:true
    },
    productCost:{
        type:String,
        required:true
    },
    stockQuantity:{
        type:String,
        required: true
    },
    qantityType:{
        type: String,
        default:'pcs'
    },
    unitValue :{
        type:String,
        required: true
        
    },tanglishName :{
        type:String,
        required: true
    },MRP:{
        type:String,
        required: true
    }

},{timestamps : true})


const ProductPcs = mongoose.model('Products',ProductPcsSchema)

export default ProductPcs