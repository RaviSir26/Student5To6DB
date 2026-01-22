import mongoose from "mongoose";

let userSchema = new mongoose.Schema({
    username:{
        type: String,
        require: true,
    },
    useremail:{
        type : String,
        require: true,
        unique: true
    },
    userpassword:{
        type : String,
        require: true,
        unique: true
    },
    createAt:{
        type: Date,
        default: Date.now
    }
});

let userModel = mongoose.model(process.env.MONGODB_USER_COLLECTION_NAME, userSchema);

export default userModel;
