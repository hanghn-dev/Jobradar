import express from "express";
import {
  signup,
  login,
  logout,
  checkAuth,
} from "../controllers/authControllers.js";
import { protectRouter } from "../utils/protectRouter.js";
import { profileUpdate } from "../controllers/authControllers.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/authCheck", protectRouter, checkAuth);
router.put("/profileUpdate", protectRouter, profileUpdate);

export default router;
