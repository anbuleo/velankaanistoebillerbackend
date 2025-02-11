import mongoose from "../common/db.connect.js";


const customerSchema = new mongoose.Schema({
    name: {
        type : String,
        required : true,
      
    },
    mobile : {
        type: String,
        required : true

    },
    address : {
        type : String,
        required : true
    },
    credit : {
        type: mongoose.Schema.Types.ObjectId,
        ref:"bill",
        default :null
    },
    purchase : {
        type: mongoose.Schema.Types.ObjectId,
        ref:"bill",
        default : null
    },
    role : {
        type : String,
        default : 'customer'
    }
},{timestamps : true})

let Customer = mongoose.model('customers',customerSchema)

export default Customer

