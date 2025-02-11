import mongoose from  '../common/db.connect.js'

let UserSchema = new mongoose.Schema({
    userName :{
        type : String,
        required : true,
        unique : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true,
        
    },
    mobile:{
        type:String,
        default:'9999999999'
    },  
    role:{
        type : String,
        default:'saleman'
    },
    activeStatus:{
        type:Boolean,
        default:false
    },
    status:{
        type:String,
        default:'pending'
    }
    
},{
    timestamps:true,
    versionKey:false
})

const User = mongoose.model('users',UserSchema)

export default User