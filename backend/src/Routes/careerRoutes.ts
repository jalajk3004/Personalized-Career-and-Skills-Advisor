import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "../services/dbServices";
import { authenticate } from "../middleware/Authenticate";
import careerController from "../controllers/careerController";
dotenv.config();

// Utility functions for formatting career data
class CareerUtils {
  /**
   * Format salary range for display
   */
  static formatSalary(min: number, max: number, currency: string = 'INR'): string {
    const formatNumber = (num: number) => {
      if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
      if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
      return num.toString();
    };

    return `${formatNumber(min)} - ${formatNumber(max)} ${currency}`;
  }

  /**
   * Format growth rate for display
   */
  static formatGrowthRate(rate: number): string {
    return `${rate}% growth`;
  }

  /**
   * Format career options for frontend display
   */
  static formatCareerOptionsForDisplay(careerOptions: any[]): any[] {
    return careerOptions.map(option => ({
      ...option,
      formatted_salary: this.formatSalary(option.salary_range_min, option.salary_range_max, option.currency),
      formatted_growth_rate: this.formatGrowthRate(option.growth_rate),
      skills_display: option.required_skills?.slice(0, 4) || [],
      additional_skills_count: Math.max(0, (option.required_skills?.length || 0) - 4)
    }));
  }
}

// Define AuthenticatedRequest interface if not already defined elsewhere
interface AuthenticatedRequest extends Request {
  user?: { uid: string };
}

const router = express();
router.use(cors({ origin: true }));
router.use(express.json());

// =================== AI-ENHANCED FORM ROUTES ===================

// Enhanced form submission with AI question generation
router.post("/ai-submit", authenticate, careerController.submitFormWithAI);

// Get AI questions for a recommendation
router.get("/ai-questions/:recommendationId", authenticate, careerController.getAIQuestions);

// Submit AI answers and generate final recommendations
router.post("/ai-answers", authenticate, careerController.submitAIAnswers);

// Get career recommendations/options for a user
router.get("/recommendations", authenticate, careerController.getCareerRecommendations);
router.get("/recommendations/:userId/:recommendationId", authenticate, careerController.getCareerRecommendations);

// =================== LEGACY ROUTES (for backward compatibility) ===================

// 1️⃣ Get all career recommendations for a user
router.get("/", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { uid } = req.user!;
    const userRes = await pool.query("SELECT user_id FROM users WHERE uid=$1", [uid]);
    if (userRes.rows.length === 0) return res.status(404).json({ message: "User not found" });

    const recsRes = await pool.query(
      "SELECT * FROM career_recommendations WHERE user_id=$1 ORDER BY created_at DESC",
      [userRes.rows[0].user_id]
    );

    res.json(recsRes.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

router.get("/:recId", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { uid } = req.user!;
    const { recId } = req.params;

    const userRes = await pool.query("SELECT user_id FROM users WHERE uid=$1", [uid]);
    if (userRes.rows.length === 0) return res.status(404).json({ message: "User not found" });

    const recRes = await pool.query(
      "SELECT * FROM career_recommendations WHERE recommendation_id=$1 AND user_id=$2",
      [recId, userRes.rows[0].user_id]
    );

    if (recRes.rows.length === 0) return res.status(404).json({ message: "Recommendation not found" });
    res.json(recRes.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch recommendation" });
  }
});

// Legacy POST route (for backward compatibility)
router.post("/", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const { uid } = req.user!; // Get UID from token
  const {
    name,
    age,
    highschool_name,
    highschool_stream,
    college,
    course_type,
    course,
    specialisation,
    no_experience,
    job_title,
    company_name,
    duration,
    skills,
    interests,
    preferred_work_env
  } = req.body;

  try {
    // Get user_id from users table
    const userRes = await pool.query(
      "SELECT user_id FROM users WHERE uid = $1",
      [uid]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user_id = userRes.rows[0].user_id;

    // Insert form data
    const insertRes = await pool.query(
      `INSERT INTO career_recommendations (
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
      RETURNING recommendation_id`,
      [
        user_id, name, age, highschool_name, highschool_stream,
        college, course_type, course, specialisation, no_experience,
        job_title, company_name, duration, skills, interests,
        preferred_work_env
      ]
    );

    res.status(201).json({
      message: "Career recommendation saved successfully 🚀",
      user_id,
      recommendation_id: insertRes.rows[0].recommendation_id
    });

  } catch (err) {
    console.error("Error saving recommendation:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;

