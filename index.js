import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import router from "./routes/apiRoutes.js";

const app = express();

const connect = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/hindalcoTwo");
    console.log("MongoDB Connected ...");
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB ...");
});
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected ...");
});

app.use(express.json());
app.use(
  cors({
    methods: ["GET", "POST", "DELETE", "PUT"],
  })
);

app.use("/backend", router);

app.listen(4000, async () => {
  try {
    await connect();
    console.log("Server is runnin on port 4000");
  } catch (error) {
    console.error("Faled to start the server:", error);
    process.exit(1);
  }
});
