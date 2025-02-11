import mongoose from '../common/db.connect.js';

const BillSchema = new mongoose.Schema({ 
    customerName : {
        type : String,
        default:'customer'
    },
    customerId :{
        type: mongoose.Schema.Types.ObjectId,
        ref:"user",
        default:null
    },
    customerMobile : {
        type : String,
        default : null
    },
    totalAmount : {
        type : Number,
        required : true
    },
    paidAmount : {
        type : Number,
        default : null
    },
    dueAmount : {
        type : Number,
        default : null
    },
    createBy : {
        type : String,
        required : true
    },
    products : {
        type : Array,
        required : true
    },
    
    
    paymentType : {
        type : String,
        required : true
    }    
    
   
   
}, { timestamps: true })
const Bill = mongoose.model('bill',BillSchema)   

export default Bill
 
