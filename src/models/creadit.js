import mongoose from "../common/db.connect.js";


const CreditSchema = new mongoose.Schema({
    BillId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'bill',
        requried: true,
        unique:true
    },
    customerId : {
        type:mongoose.Schema.Types.ObjectId,
        ref:'customers',
        required:true
    }


},{
    timestamps:true,
    versionKey:false
}
)

const Credit = mongoose.model('credit',CreditSchema)


export default Credit