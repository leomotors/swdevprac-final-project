import express, { Router } from "express";
import { register, login, getMe, logout } from "../controllers/auth";
import { protect } from "../middleware/auth";

const router: Router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/logout", logout);

export default router;
