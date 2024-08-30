import express from "express";
import { signup, login, validateToken } from "../controller/sensor.js";

const router = express.Router();

router.get("/hindalcoSignup", signup);
router.post("/login", login);
router.post("/validateToken", validateToken);

export default router;