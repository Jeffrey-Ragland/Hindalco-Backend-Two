import mongoose from "mongoose";

const hindalcoTimeSchema = new mongoose.Schema(
  {
    DeviceName: String,
    T1: String,
    T2: String,
    T3: String,
    T4: String,
    T5: String,
    T6: String,
    T7: String,
    T8: String,
    T9: String,
    T10: String,
    T11: String,
    T12: String,
    T13: String,
    T14: String,
    T15: String,
    DeviceTemperature: String,
    DeviceBattery: String,
    DeviceSignal: String,
    Time: String
  }
);

const hindalcoTimeModel = mongoose.model("hindalcoTimeData", hindalcoTimeSchema);
export default hindalcoTimeModel;