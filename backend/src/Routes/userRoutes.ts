import express from "express";
import { authenticate } from "../middleware/Authenticate.js";
import { Request, Response } from "express";
import admin from "../config/firebase-admin.js";

// Use your AuthenticatedRequest type here
interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

const router = express.Router();

router.get("/me", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { email, uid } = req.user;
  res.json({
    uid,
    email,
  });
});

export default router;
