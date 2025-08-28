import { Request, Response, NextFunction } from "express";
import admin from "../config/firebase-admin.js";

// Extend the Request interface inline
interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken; 
    next();
  } catch (err) {
    console.error("Firebase token verification error:", err);
    res.status(401).json({ message: "Unauthorized" });
  }
}