import express from "express";

import { Request, Response } from "express";
import { register, login, googleLogin } from "../controllers/authController";
import pool from "../services/dbServices";
import { authenticate } from "../middleware/Authenticate";

interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = express.Router();

// Auth Endpoints
router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);

// Protected user routes
router.get("/me", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { email, uid } = req.user;

  try {
    // The user should already exist from login/register, but we can return it.
    const query = `SELECT * FROM users WHERE uid = $1`;
    const result = await pool.query(query, [uid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User fetched successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Database error" });
  }
});

export default router;
