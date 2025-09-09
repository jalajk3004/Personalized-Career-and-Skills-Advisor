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
const Authenticate_1 = require("../middleware/Authenticate");
dotenv_1.default.config();
const router = (0, express_1.default)();
router.use((0, cors_1.default)({ origin: true }));
router.use(express_1.default.json());
// 1️⃣ Get all career recommendations for a user
router.get("/", Authenticate_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid } = req.user;
        const userRes = yield dbServices_1.default.query("SELECT user_id FROM users WHERE uid=$1", [uid]);
        if (userRes.rows.length === 0)
            return res.status(404).json({ message: "User not found" });
        const recsRes = yield dbServices_1.default.query("SELECT * FROM career_recommendations WHERE user_id=$1 ORDER BY created_at DESC", [userRes.rows[0].user_id]);
        res.json(recsRes.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch recommendations" });
    }
}));
router.get("/:recId", Authenticate_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { uid } = req.user;
        const { recId } = req.params;
        const userRes = yield dbServices_1.default.query("SELECT user_id FROM users WHERE uid=$1", [uid]);
        if (userRes.rows.length === 0)
            return res.status(404).json({ message: "User not found" });
        const recRes = yield dbServices_1.default.query("SELECT * FROM career_recommendations WHERE recommendation_id=$1 AND user_id=$2", [recId, userRes.rows[0].user_id]);
        if (recRes.rows.length === 0)
            return res.status(404).json({ message: "Recommendation not found" });
        res.json(recRes.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch recommendation" });
    }
}));
router.post("/", Authenticate_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.user; // Get UID from token
    const { name, age, highschool_name, highschool_stream, college, course_type, course, specialisation, no_experience, job_title, company_name, duration, skills, interests, preferred_work_env } = req.body;
    try {
        // Get user_id from users table
        const userRes = yield dbServices_1.default.query("SELECT user_id FROM users WHERE uid = $1", [uid]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const user_id = userRes.rows[0].user_id;
        // Insert form data
        const insertRes = yield dbServices_1.default.query(`INSERT INTO career_recommendations (
        user_id, name, age, highschool_name, highschool_stream, 
        college, course_type, course, specialisation, no_experience,
        job_title, company_name, duration, skills, interests,
        preferred_work_env
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16
      )
      RETURNING recommendation_id`, [
            user_id, name, age, highschool_name, highschool_stream,
            college, course_type, course, specialisation, no_experience,
            job_title, company_name, duration, skills, interests,
            preferred_work_env
        ]);
        res.status(201).json({
            message: "Career recommendation saved successfully 🚀",
            user_id,
            recommendation_id: insertRes.rows[0].recommendation_id
        });
    }
    catch (err) {
        console.error("Error saving recommendation:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}));
exports.default = router;
