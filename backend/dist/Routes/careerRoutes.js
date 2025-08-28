"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const dbServices_1 = __importDefault(require("../services/dbServices"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
// ------------------ Routes ------------------
// Health check
app.get("/", (req, res) => {
    res.send("Server is running 🚀");
});
// 1️⃣ Get all career recommendations for a user
app.get("/api/users/:uid/career-recommendations", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    try {
        const userRes = yield dbServices_1.default.query("SELECT user_id FROM users WHERE uid = $1", [uid]);
        if (userRes.rows.length === 0)
            return res.status(404).json({ message: "User not found" });
        const userId = userRes.rows[0].user_id;
        const recsRes = yield dbServices_1.default.query("SELECT * FROM career_recommendations WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
        res.json(recsRes.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch career recommendations" });
    }
}));
// 2️⃣ Get a single career recommendation for a user
app.get("/api/users/:uid/career-recommendations/:recId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid, recId } = req.params;
    try {
        const userRes = yield dbServices_1.default.query("SELECT user_id FROM users WHERE uid = $1", [uid]);
        if (userRes.rows.length === 0)
            return res.status(404).json({ message: "User not found" });
        const userId = userRes.rows[0].user_id;
        const recRes = yield dbServices_1.default.query("SELECT * FROM career_recommendations WHERE recommendation_id = $1 AND user_id = $2", [recId, userId]);
        if (recRes.rows.length === 0)
            return res.status(404).json({ message: "Recommendation not found" });
        res.json(recRes.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch career recommendation" });
    }
}));
// 3️⃣ Create a new career recommendation
app.post("/api/users/:uid/career-recommendations", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    const form = req.body;
    try {
        const userRes = yield dbServices_1.default.query("SELECT user_id FROM users WHERE uid = $1", [uid]);
        if (userRes.rows.length === 0)
            return res.status(404).json({ message: "User not found" });
        const userId = userRes.rows[0].user_id;
        const insertQuery = `
      INSERT INTO career_recommendations
      (user_id, highschool_name, highschool_stream, college, course_type, course, specialisation,
       no_experience, job_title, company_name, duration, key_skills, interests, preferred_work_env, skills_possess, recommendations)
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *
    `;
        const values = [
            userId,
            form.highschoolName,
            form.highschoolStream,
            form.college,
            form.courseType,
            form.course,
            form.specialisation,
            form.noExperience,
            form.jobTitle,
            form.companyName,
            form.duration,
            form.keySkills,
            form.interests,
            form.preferredWorkEnv,
            form.skillsPossess,
            form.recommendations, // array of recommended careers
        ];
        const result = yield dbServices_1.default.query(insertQuery, values);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to submit career recommendation" });
    }
}));
// ------------------ Server ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
