
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



app.get("/", async (req, res) => {
  const result = await pool.query("SELECT current_database()");
  res.json(  `the databsae is :${result.rows[0].current_database}`  );
});

app.use("/api/users", userRouter );
app.use("/api/career-recommendations", careerRouter );


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});