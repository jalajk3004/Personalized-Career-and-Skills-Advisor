
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import userRouter  from "./Routes/userRoutes";
import careerRouter  from "./Routes/careerRoutes";
import pool from "./services/dbServices";


const app = express();


app.use(cors({ origin: true }));
app.use(express.json());


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


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});