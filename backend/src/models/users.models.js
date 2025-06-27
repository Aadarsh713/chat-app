import mongoose from "mongoose";


// creating user schema
const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
    profilePic: {
        type: String,
        default: "",
    },
}, {
    timestamps: true,
}); 


const User = mongoose.model("User", userSchema);
export default User;