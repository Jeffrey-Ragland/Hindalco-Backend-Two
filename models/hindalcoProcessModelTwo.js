import mongoose from "mongoose";

const processSchema = new mongoose.Schema({
  DeviceName: String,
  StartTime: String,
  AutoStopTime: String,
  ActualStopTime: String,
  SelectedThermocouples: [String],
  LineName: String,
  PotNumber: String,
});

const hindalcoProcessModelTwo = mongoose.model(
  "HindalcoProcessTwo",
  processSchema
);
export default hindalcoProcessModelTwo;
