import express from "express";
import { authenticate } from "../middleware/Authenticate.js";
import { Request, Response } from "express";
import admin from "../config/firebase-admin.js";
import pool from "../services/dbServices.js";

interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

const router = express.Router();

router.get("/me", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { email, uid } = req.user;

  try {
    // 🟢 Insert into Postgres if user does not already exist
    const query = `
      INSERT INTO users (uid, email)
      VALUES ($1, $2)
      ON CONFLICT (uid) DO UPDATE 
      SET email = EXCLUDED.email
      RETURNING *;
    `;
    const result = await pool.query(query, [uid, email]);

    res.json({
      message: "User authenticated & saved in database ✅",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error saving user:", error);
    res.status(500).json({ message: "Database error" });
  }
});

export default router;
