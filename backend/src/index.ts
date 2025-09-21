
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
dotenv.config();
import userRouter  from "./Routes/userRoutes";
import careerRouter  from "./Routes/careerRoutes";
import pool from "./services/dbServices";


const app = express();

// Enable CORS for all origins (adjust for production)
app.use(cors({ origin: true }));
app.use(express.json());

// Serve static files from the public directory (frontend build)
app.use(express.static(path.join(__dirname, '../public')));


// server.js (temporary debugging code)



// Health check endpoint
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT current_database(), current_user, version()");
    res.json({
      status: "healthy",
      database: result.rows[0].current_database,
      user: result.rows[0].current_user,
      version: result.rows[0].version.split(' ')[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      status: "unhealthy",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});

// Additional health check endpoint
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ 
      status: "error", 
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});

app.use("/api/users", userRouter );
app.use("/api/career-recommendations", careerRouter );

// Catch-all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});