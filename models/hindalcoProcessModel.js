import mongoose from 'mongoose';

const processSchema = new mongoose.Schema({
    ProcessStatus: String,
    Time: String
});

const hindalcoProcessModel = mongoose.model('HindalcoProcess', processSchema);
export default hindalcoProcessModel;