import mongoose from 'mongoose';

const processSchema = new mongoose.Schema({
  DeviceName: String,
  ProcessStatus: String,
  ButtonClickedTime: String
});

const hindalcoProcessModel = mongoose.model('HindalcoProcess', processSchema);
export default hindalcoProcessModel;