import mongoose from 'mongoose';

const loginSchema = new mongoose.Schema({
    Username: String,
    Password: String
});

const loginModel = mongoose.model("HindalcoUser", loginSchema);
export default loginModel;