import express from "express";
import {
  signup,
  login,
  validateToken,
  insertHindalcoData,
  getHindalcoData,
  getHindalcoReport,
  getHindalcoAverageReport,
} from "../controller/sensor.js";

const router = express.Router();

router.get("/hindalcoSignup", signup);
router.post("/login", login);
router.post("/validateToken", validateToken);
router.get("/insertHindalcoData", insertHindalcoData);
router.get("/getHindalcoData", getHindalcoData);
router.get("/getHindalcoReport", getHindalcoReport);
router.get("/getHindalcoAverageReport", getHindalcoAverageReport);

export default router;