"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const geminiService_1 = __importDefault(require("../services/geminiService"));
const dbServices_1 = __importStar(require("../services/dbServices"));
// Standalone function to generate AI questions from database data
function generateAIQuestionsFromDB(dbData) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            // Convert database data to Q&A format for AI
            const qaContext = [
                { question: "What is your name?", answer: dbData.name, category: "personal" },
                { question: "What is your age?", answer: (_a = dbData.age) === null || _a === void 0 ? void 0 : _a.toString(), category: "personal" },
                { question: "What high school did you attend?", answer: dbData.highschool_name, category: "education" },
                { question: "What was your high school stream?", answer: dbData.highschool_stream, category: "education" },
                { question: "What college did you attend?", answer: dbData.college, category: "education" },
                { question: "What type of course did you pursue?", answer: dbData.course_type, category: "education" },
                { question: "What was your course/degree?", answer: dbData.course, category: "education" },
                { question: "What was your specialization?", answer: dbData.specialisation, category: "education" },
                { question: "Do you have work experience?", answer: dbData.no_experience ? "No" : "Yes", category: "experience" },
                { question: "What is your job title?", answer: dbData.job_title, category: "experience" },
                { question: "What company do you work for?", answer: dbData.company_name, category: "experience" },
                { question: "How long have you been working?", answer: dbData.duration, category: "experience" },
                { question: "What are your key skills?", answer: dbData.skills, category: "skills" },
                { question: "What are your interests?", answer: dbData.interests, category: "interests" },
                { question: "What is your preferred work environment?", answer: dbData.preferred_work_env, category: "preferences" }
            ].filter(qa => qa.answer && qa.answer.trim() !== ''); // Filter out empty answers
            // Generate AI questions using Gemini
            const generatedQuestions = yield geminiService_1.default.generateFollowUpQuestions(qaContext, 5);
            // Convert to our format and add IDs
            return generatedQuestions.map((q, index) => ({
                id: `ai_${Date.now()}_${index}`,
                question_text: q.question_text,
                question_type: q.question_type,
                category: q.category,
                options: q.options,
                is_required: q.is_required
            }));
        }
        catch (error) {
            console.error('Error in generateAIQuestionsFromDB:', error);
            throw error;
        }
    });
}
class CareerController {
    constructor() {
        // Bind all methods to maintain 'this' context
        this.submitFormWithAI = this.submitFormWithAI.bind(this);
        this.getAIQuestions = this.getAIQuestions.bind(this);
        this.submitAIAnswers = this.submitAIAnswers.bind(this);
        this.getCareerRecommendations = this.getCareerRecommendations.bind(this);
        this.generateRoadmap = this.generateRoadmap.bind(this);
    }
    // =================== ENHANCED FORM SUBMISSION WITH AI ===================
    /**
     * Enhanced form submission that generates AI questions after static form completion
     */
    submitFormWithAI(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { uid } = req.user;
                const formData = req.body;
                // Get user_id from users table
                const userRes = yield dbServices_1.default.query("SELECT user_id FROM users WHERE uid = $1", [uid]);
                if (userRes.rows.length === 0) {
                    return res.status(404).json({ error: "User not found" });
                }
                const user_id = userRes.rows[0].user_id;
                // Save the static form data first (existing logic)
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
                    user_id, formData.name, formData.age, formData.highschool_name, formData.highschool_stream,
                    formData.college, formData.course_type, formData.course, formData.specialisation, formData.no_experience,
                    formData.job_title, formData.company_name, formData.duration, formData.skills, formData.interests,
                    formData.preferred_work_env
                ]);
                const recommendation_id = insertRes.rows[0].recommendation_id;
                // Generate AI questions based on the database data
                try {
                    // Get the saved data from database to use as context
                    const savedDataRes = yield dbServices_1.default.query("SELECT * FROM career_recommendations WHERE recommendation_id = $1", [recommendation_id]);
                    const savedData = savedDataRes.rows[0];
                    const aiQuestions = yield generateAIQuestionsFromDB(savedData);
                    // Store AI questions in the existing table as JSON
                    yield dbServices_1.default.query(`UPDATE career_recommendations 
           SET ai_questions = $1 
           WHERE recommendation_id = $2`, [JSON.stringify(aiQuestions), recommendation_id]);
                    res.status(201).json({
                        success: true,
                        message: "Form submitted and AI questions generated successfully! 🚀",
                        user_id,
                        recommendation_id,
                        ai_questions: aiQuestions,
                        has_ai_questions: true
                    });
                }
                catch (aiError) {
                    console.error('AI question generation failed:', aiError);
                    // Still return success for the main form, but without AI questions
                    res.status(201).json({
                        success: true,
                        message: "Form submitted successfully! 🚀",
                        user_id,
                        recommendation_id,
                        has_ai_questions: false,
                        ai_error: "AI questions could not be generated"
                    });
                }
            }
            catch (error) {
                console.error("Error in submitFormWithAI:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
    }
    /**
     * Generate AI questions based on form data
     */
    generateAIQuestions(formData) {
        return __awaiter(this, void 0, void 0, function* () {
            // Convert form data to Q&A format for AI
            const qaContext = this.convertFormDataToQA(formData);
            // Generate AI questions using Gemini
            const generatedQuestions = yield geminiService_1.default.generateFollowUpQuestions(qaContext, 5);
            // Convert to our format and add IDs
            return generatedQuestions.map((q, index) => ({
                id: `ai_${Date.now()}_${index}`,
                question_text: q.question_text,
                question_type: q.question_type,
                category: q.category,
                options: q.options,
                is_required: q.is_required
            }));
        });
    }
    /**
     * Convert form data to Q&A format for AI processing
     */
    convertFormDataToQA(formData) {
        var _a;
        const qaMap = [
            { question: "What is your name?", answer: formData.name, category: "personal" },
            { question: "What is your age?", answer: (_a = formData.age) === null || _a === void 0 ? void 0 : _a.toString(), category: "personal" },
            { question: "What high school did you attend?", answer: formData.highschool_name, category: "education" },
            { question: "What was your high school stream?", answer: formData.highschool_stream, category: "education" },
            { question: "What college did you attend?", answer: formData.college, category: "education" },
            { question: "What type of course did you pursue?", answer: formData.course_type, category: "education" },
            { question: "What was your course/degree?", answer: formData.course, category: "education" },
            { question: "What was your specialization?", answer: formData.specialisation, category: "education" },
            { question: "Do you have work experience?", answer: formData.no_experience ? "No" : "Yes", category: "experience" },
            { question: "What is your job title?", answer: formData.job_title, category: "experience" },
            { question: "What company do you work for?", answer: formData.company_name, category: "experience" },
            { question: "How long have you been working?", answer: formData.duration, category: "experience" },
            { question: "What are your key skills?", answer: formData.skills, category: "skills" },
            { question: "What are your interests?", answer: formData.interests, category: "interests" },
            { question: "What is your preferred work environment?", answer: formData.preferred_work_env, category: "preferences" }
        ];
        // Filter out empty answers
        return qaMap.filter(qa => qa.answer && qa.answer.trim() !== '');
    }
    /**
     * Get AI questions for a recommendation
     */
    getAIQuestions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { uid } = req.user;
                const { recommendationId } = req.params;
                const userRes = yield dbServices_1.default.query("SELECT user_id FROM users WHERE uid=$1", [uid]);
                if (userRes.rows.length === 0) {
                    return res.status(404).json({ message: "User not found" });
                }
                const result = yield dbServices_1.default.query("SELECT ai_questions FROM career_recommendations WHERE recommendation_id=$1 AND user_id=$2", [recommendationId, userRes.rows[0].user_id]);
                if (result.rows.length === 0) {
                    return res.status(404).json({ message: "Recommendation not found" });
                }
                const aiQuestions = result.rows[0].ai_questions;
                // Handle both string and object cases
                let parsedQuestions = [];
                if (aiQuestions) {
                    if (typeof aiQuestions === 'string') {
                        try {
                            parsedQuestions = JSON.parse(aiQuestions);
                        }
                        catch (error) {
                            console.error('Error parsing ai_questions string:', error);
                            parsedQuestions = [];
                        }
                    }
                    else {
                        // Already an object/array
                        parsedQuestions = aiQuestions;
                    }
                }
                res.json({
                    success: true,
                    data: {
                        recommendation_id: recommendationId,
                        ai_questions: parsedQuestions,
                        has_ai_questions: !!aiQuestions
                    }
                });
            }
            catch (error) {
                console.error("Error getting AI questions:", error);
                res.status(500).json({ error: "Failed to get AI questions" });
            }
        });
    }
    /**
     * Submit AI question answers and generate final recommendations
     */
    submitAIAnswers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { uid } = req.user;
                const { recommendationId, ai_answers } = req.body;
                const userRes = yield dbServices_1.default.query("SELECT user_id FROM users WHERE uid=$1", [uid]);
                if (userRes.rows.length === 0) {
                    return res.status(404).json({ message: "User not found" });
                }
                // Save AI answers
                yield dbServices_1.default.query("UPDATE career_recommendations SET ai_answers = $1 WHERE recommendation_id = $2 AND user_id = $3", [JSON.stringify(ai_answers), recommendationId, userRes.rows[0].user_id]);
                // Get complete data for final recommendations
                const recResult = yield dbServices_1.default.query("SELECT * FROM career_recommendations WHERE recommendation_id = $1 AND user_id = $2", [recommendationId, userRes.rows[0].user_id]);
                if (recResult.rows.length === 0) {
                    return res.status(404).json({ message: "Recommendation not found" });
                }
                const completeData = recResult.rows[0];
                // Convert form data to QA format
                const formDataQA = [
                    { question: "What is your name?", answer: completeData.name, category: "personal" },
                    { question: "What is your age?", answer: (_a = completeData.age) === null || _a === void 0 ? void 0 : _a.toString(), category: "personal" },
                    { question: "What high school did you attend?", answer: completeData.highschool_name, category: "education" },
                    { question: "What was your high school stream?", answer: completeData.highschool_stream, category: "education" },
                    { question: "What college did you attend?", answer: completeData.college, category: "education" },
                    { question: "What type of course did you pursue?", answer: completeData.course_type, category: "education" },
                    { question: "What was your course/degree?", answer: completeData.course, category: "education" },
                    { question: "What was your specialization?", answer: completeData.specialisation, category: "education" },
                    { question: "Do you have work experience?", answer: completeData.no_experience ? "No" : "Yes", category: "experience" },
                    { question: "What is your job title?", answer: completeData.job_title, category: "experience" },
                    { question: "What company do you work for?", answer: completeData.company_name, category: "experience" },
                    { question: "How long have you been working?", answer: completeData.duration, category: "experience" },
                    { question: "What are your key skills?", answer: completeData.skills, category: "skills" },
                    { question: "What are your interests?", answer: completeData.interests, category: "interests" },
                    { question: "What is your preferred work environment?", answer: completeData.preferred_work_env, category: "preferences" }
                ].filter(qa => qa.answer && qa.answer.trim() !== '');
                // Generate final AI recommendations
                const allQA = [
                    ...formDataQA,
                    ...ai_answers.map((ans) => ({
                        question: ans.question,
                        answer: ans.answer,
                        category: ans.category || 'ai_generated'
                    }))
                ];
                const finalRecommendations = yield geminiService_1.default.generateCareerRecommendations(allQA);
                // Generate career options for database storage
                const careerOptions = yield geminiService_1.default.generateCareerOptionsForDB(allQA, userRes.rows[0].user_id);
                // Save career options to database
                const savedCareerOptions = yield dbServices_1.careerOptionsService.saveCareerOptions(userRes.rows[0].user_id, careerOptions);
                // Save final recommendations
                yield dbServices_1.default.query("UPDATE career_recommendations SET final_recommendations = $1 WHERE recommendation_id = $2", [JSON.stringify(finalRecommendations), recommendationId]);
                res.json({
                    success: true,
                    data: {
                        message: "AI answers submitted, recommendations generated, and career options saved!",
                        user_id: userRes.rows[0].user_id,
                        recommendation_id: recommendationId,
                        final_recommendations: finalRecommendations,
                        career_options_count: savedCareerOptions.length
                    }
                });
            }
            catch (error) {
                console.error("Error submitting AI answers:", error);
                res.status(500).json({ error: "Failed to submit AI answers" });
            }
        });
    }
    /**
     * Get career recommendations/options for a user
     */
    getCareerRecommendations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { uid } = req.user;
                const { userId, recommendationId } = req.params;
                // Get user_id from users table
                const userRes = yield dbServices_1.default.query("SELECT user_id FROM users WHERE uid = $1", [uid]);
                if (userRes.rows.length === 0) {
                    return res.status(404).json({ message: "User not found" });
                }
                const user_id = userRes.rows[0].user_id;
                // Verify the user owns this recommendation (if recommendationId is provided)
                if (recommendationId) {
                    const recCheck = yield dbServices_1.default.query("SELECT user_id FROM career_recommendations WHERE recommendation_id = $1", [recommendationId]);
                    if (recCheck.rows.length === 0) {
                        return res.status(404).json({ message: "Recommendation not found" });
                    }
                    if (recCheck.rows[0].user_id !== user_id) {
                        return res.status(403).json({ message: "Access denied" });
                    }
                }
                const careerOptions = yield dbServices_1.careerOptionsService.getCareerOptionsForUser(user_id);
                if (careerOptions.length === 0) {
                    return res.json({
                        success: true,
                        message: "No career recommendations found. Please complete the career assessment first.",
                        data: {
                            career_options: [],
                            has_recommendations: false
                        }
                    });
                }
                // Format career options with display-friendly data
                const formattedCareerOptions = careerOptions.map(option => {
                    var _a, _b;
                    return (Object.assign(Object.assign({}, option), { formatted_salary: this.formatSalary(option.salary_range_min, option.salary_range_max, option.currency), formatted_growth_rate: this.formatGrowthRate(option.growth_rate), skills_display: ((_a = option.required_skills) === null || _a === void 0 ? void 0 : _a.slice(0, 4)) || [], additional_skills_count: Math.max(0, (((_b = option.required_skills) === null || _b === void 0 ? void 0 : _b.length) || 0) - 4) }));
                });
                res.json({
                    success: true,
                    message: "Career recommendations retrieved successfully",
                    data: {
                        career_options: formattedCareerOptions,
                        has_recommendations: true,
                        count: careerOptions.length
                    }
                });
            }
            catch (error) {
                console.error("❌ Error getting career recommendations:", error);
                console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
                res.status(500).json({
                    error: "Failed to get career recommendations",
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Format salary range for display
     */
    formatSalary(min, max, currency = 'INR') {
        const formatNumber = (num) => {
            if (num >= 10000000)
                return `${(num / 10000000).toFixed(1)}Cr`;
            if (num >= 100000)
                return `${(num / 100000).toFixed(1)}L`;
            if (num >= 1000)
                return `${(num / 1000).toFixed(0)}K`;
            return num.toString();
        };
        return `${formatNumber(min)} - ${formatNumber(max)} ${currency}`;
    }
    /**
     * Format growth rate for display
     */
    formatGrowthRate(rate) {
        return `${rate}% growth`;
    }
    /**
     * Generate roadmap for a specific career
     */
    generateRoadmap(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { uid } = req.user;
                const { userId, recommendationId, title } = req.params;
                // Get user_id from users table
                const userRes = yield dbServices_1.default.query("SELECT user_id FROM users WHERE uid = $1", [uid]);
                if (userRes.rows.length === 0) {
                    return res.status(404).json({ message: "User not found" });
                }
                const user_id = userRes.rows[0].user_id;
                // Verify the user owns this recommendation
                const recCheck = yield dbServices_1.default.query("SELECT user_id FROM career_recommendations WHERE recommendation_id = $1", [recommendationId]);
                if (recCheck.rows.length === 0) {
                    return res.status(404).json({ message: "Recommendation not found" });
                }
                if (recCheck.rows[0].user_id !== user_id) {
                    return res.status(403).json({ message: "Access denied" });
                }
                // Get user's career data for roadmap generation
                const recResult = yield dbServices_1.default.query("SELECT * FROM career_recommendations WHERE recommendation_id = $1 AND user_id = $2", [recommendationId, user_id]);
                if (recResult.rows.length === 0) {
                    return res.status(404).json({ message: "Career data not found" });
                }
                const careerData = recResult.rows[0];
                // Convert database data to CareerData format for Gemini
                const userData = {
                    name: careerData.name,
                    age: careerData.age,
                    highschool_name: careerData.highschool_name,
                    highschool_stream: careerData.highschool_stream,
                    college: careerData.college,
                    course_type: careerData.course_type,
                    course: careerData.course,
                    specialisation: careerData.specialisation,
                    no_experience: careerData.no_experience,
                    job_title: careerData.job_title,
                    company_name: careerData.company_name,
                    duration: careerData.duration,
                    skills: careerData.skills,
                    interests: careerData.interests,
                    preferred_work_env: careerData.preferred_work_env
                };
                // Convert AI answers to Q&A format if available
                let allAnswers = [];
                if (careerData.ai_answers) {
                    try {
                        const aiAnswers = typeof careerData.ai_answers === 'string'
                            ? JSON.parse(careerData.ai_answers)
                            : careerData.ai_answers;
                        allAnswers = aiAnswers.map((ans) => ({
                            question: ans.question,
                            answer: ans.answer,
                            category: ans.category || 'ai_generated'
                        }));
                    }
                    catch (error) {
                        console.error('Error parsing AI answers:', error);
                    }
                }
                // Decode the career title from URL format, handling special characters
                const careerTitle = title.replace(/-/g, ' ').replace(/_/g, '/').replace(/\b\w/g, l => l.toUpperCase());
                // Generate roadmap using Gemini service
                const roadmapData = yield geminiService_1.default.generateCareerRoadmap(careerTitle, userData, allAnswers);
                // Transform backend format to frontend format
                const transformedRoadmap = this.transformRoadmapForFrontend(roadmapData);
                res.json({
                    success: true,
                    data: transformedRoadmap
                });
            }
            catch (error) {
                console.error("❌ Error generating roadmap:", error);
                res.status(500).json({
                    error: "Failed to generate roadmap",
                    details: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    /**
     * Transform backend roadmap format to frontend format
     */
    transformRoadmapForFrontend(roadmapData) {
        const transformedSteps = roadmapData.roadmap.map((step, index) => ({
            id: `step_${index + 1}`,
            name: step.step,
            description: step.description,
            link: this.generateStepLink(step.step, step.description),
            icon: this.getStepIcon(step.step),
            completed: false,
            sub_steps: step.sub_steps || [],
            duration: step.duration || '2-4 weeks',
            key_outcomes: step.key_outcomes || []
        }));
        return {
            name: roadmapData.career,
            description: `Personalized roadmap for ${roadmapData.career} career path`,
            steps: transformedSteps,
            estimated_timeline: roadmapData.estimated_timeline || '18-24 months',
            difficulty_level: roadmapData.difficulty_level || 'Intermediate'
        };
    }
    /**
     * Generate appropriate link for roadmap step
     */
    generateStepLink(stepName, description) {
        const stepLower = stepName.toLowerCase();
        // Map step names to relevant learning resources
        if (stepLower.includes('foundation') || stepLower.includes('basic')) {
            return 'https://www.coursera.org/';
        }
        else if (stepLower.includes('skill') || stepLower.includes('learn')) {
            return 'https://www.udemy.com/';
        }
        else if (stepLower.includes('project') || stepLower.includes('practice')) {
            return 'https://github.com/';
        }
        else if (stepLower.includes('network') || stepLower.includes('connect')) {
            return 'https://www.linkedin.com/';
        }
        else if (stepLower.includes('certification') || stepLower.includes('certificate')) {
            return 'https://www.edx.org/';
        }
        else if (stepLower.includes('job') || stepLower.includes('apply')) {
            return 'https://www.naukri.com/';
        }
        else {
            return 'https://www.google.com/search?q=' + encodeURIComponent(stepName);
        }
    }
    /**
     * Get appropriate icon for roadmap step
     */
    getStepIcon(stepName) {
        const stepLower = stepName.toLowerCase();
        if (stepLower.includes('foundation') || stepLower.includes('basic')) {
            return '🏗️';
        }
        else if (stepLower.includes('skill') || stepLower.includes('learn')) {
            return '📚';
        }
        else if (stepLower.includes('project') || stepLower.includes('practice')) {
            return '💻';
        }
        else if (stepLower.includes('network') || stepLower.includes('connect')) {
            return '🤝';
        }
        else if (stepLower.includes('certification') || stepLower.includes('certificate')) {
            return '🏆';
        }
        else if (stepLower.includes('job') || stepLower.includes('apply')) {
            return '💼';
        }
        else if (stepLower.includes('experience') || stepLower.includes('internship')) {
            return '🎯';
        }
        else {
            return '📋';
        }
    }
}
exports.default = new CareerController();
