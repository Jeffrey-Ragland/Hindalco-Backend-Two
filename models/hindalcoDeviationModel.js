import mongoose from "mongoose";

const deviationSchema = new mongoose.Schema({
  DeviceName: String,

  T4Status: {
    DeviationUsed: {
      type: Number,
    },
    Difference: {
      type: Number,
    },
    Status: {
      type: String,
    },
    Hour: {
      type: String,
    },
  },

  T5Status: {
    DeviationUsed: {
      type: Number,
    },
    Difference: {
      type: Number,
    },
    Status: {
      type: String,
    },
    Hour: {
      type: String,
    },
  },

  T6Status: {
    DeviationUsed: {
      type: Number,
    },
    Difference: {
      type: Number,
    },
    Status: {
      type: String,
    },
    Hour: {
      type: String,
    },
  },
});

const deviationModel = mongoose.model("HindalcoDeviation", deviationSchema);
export default deviationModel;
