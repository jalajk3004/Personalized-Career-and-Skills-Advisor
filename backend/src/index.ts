
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();


// Import controllers



// Create Express app
const app = express();


app.use(cors({ origin: true }));
app.use(express.json());

// Routes
// app.post("/api/career/recommendations", authenticateUser, careerController.generateRecommendations);
// app.get("/api/career/recommendations", authenticateUser, careerController.getRecommendations);



app.get("/", (req, res) => {
  res.json({ status: "working" } );
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});