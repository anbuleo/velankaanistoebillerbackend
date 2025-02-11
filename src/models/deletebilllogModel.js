import mongoose from '../common/db.connect.js'


const deleSchema = new mongoose.Schema({
    billId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'bill',
        required:true
    },
    customerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'bill',
        default:null
    },
    isUnknownCustomer:{
        type:Boolean,
        required :true
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
    deletedBy : {
        type : String,
        required : true
    },
    products : {
        type : Array,
        required : true
    },

    deletedAt: { type: Date, default: Date.now }

})


const DeleteBill = mongoose.model('deletebill',deleSchema)

export default DeleteBill