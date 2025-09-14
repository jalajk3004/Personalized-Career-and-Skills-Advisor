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
exports.careerOptionsService = exports.formService = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pool = new pg_1.Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
pool.on('connect', () => {
    console.log('Connected to the database');
});
class FormService {
    // =================== FORM SESSION METHODS ===================
    /**
     * Get or create form session for user
     */
    getOrCreateFormSession(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Try to get existing session
                let result = yield pool.query('SELECT * FROM form_sessions WHERE user_id = $1 AND is_completed = FALSE ORDER BY created_at DESC LIMIT 1', [user_id]);
                if (result.rows.length > 0) {
                    return result.rows[0];
                }
                // Create new session
                const staticQuestionsCount = yield this.getStaticQuestionsCount();
                result = yield pool.query(`INSERT INTO form_sessions (user_id, current_step, total_steps, ai_questions_generated, is_completed) 
         VALUES ($1, 1, $2, FALSE, FALSE) RETURNING *`, [user_id, staticQuestionsCount]);
                return result.rows[0];
            }
            catch (error) {
                console.error('Error in getOrCreateFormSession:', error);
                throw error;
            }
        });
    }
    /**
     * Update form session
     */
    updateFormSession(user_id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const setClause = Object.keys(updates)
                .map((key, index) => `${key} = $${index + 2}`)
                .join(', ');
            const values = [user_id, ...Object.values(updates)];
            const result = yield pool.query(`UPDATE form_sessions SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND is_completed = FALSE RETURNING *`, values);
            return result.rows[0];
        });
    }
    // =================== QUESTION METHODS ===================
    /**
     * Get static questions (predefined questions)
     */
    getStaticQuestions() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM form_questions WHERE is_ai_generated = FALSE ORDER BY order_sequence');
            return result.rows;
        });
    }
    /**
     * Get count of static questions
     */
    getStaticQuestionsCount() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT COUNT(*) as count FROM form_questions WHERE is_ai_generated = FALSE');
            return parseInt(result.rows[0].count);
        });
    }
    /**
     * Get AI-generated questions for a user
     */
    getAIQuestions(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM form_questions WHERE user_id = $1 AND is_ai_generated = TRUE ORDER BY order_sequence', [user_id]);
            return result.rows;
        });
    }
    /**
     * Get all questions for a user (static + AI)
     */
    getAllQuestionsForUser(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query(`SELECT * FROM form_questions 
       WHERE (is_ai_generated = FALSE) OR (user_id = $1 AND is_ai_generated = TRUE)
       ORDER BY order_sequence`, [user_id]);
            return result.rows;
        });
    }
    /**
     * Get single question by ID
     */
    getQuestionById(question_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM form_questions WHERE question_id = $1', [question_id]);
            return result.rows[0] || null;
        });
    }
    /**
     * Get questions for current step
     */
    getQuestionsForStep(user_id_1, step_1) {
        return __awaiter(this, arguments, void 0, function* (user_id, step, questionsPerStep = 3) {
            const offset = (step - 1) * questionsPerStep;
            const result = yield pool.query(`SELECT * FROM form_questions 
       WHERE (is_ai_generated = FALSE) OR (user_id = $1 AND is_ai_generated = TRUE)
       ORDER BY order_sequence
       LIMIT $2 OFFSET $3`, [user_id, questionsPerStep, offset]);
            return result.rows;
        });
    }
    /**
     * Save AI-generated questions for a user
     */
    saveAIQuestions(user_id, questions) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            try {
                yield client.query('BEGIN');
                const savedQuestions = [];
                // Get the highest order_sequence to continue numbering
                const maxOrderResult = yield client.query('SELECT COALESCE(MAX(order_sequence), 0) as max_order FROM form_questions');
                let nextOrder = maxOrderResult.rows[0].max_order + 1;
                for (const question of questions) {
                    const result = yield client.query(`INSERT INTO form_questions 
           (user_id, question_text, question_type, options, is_ai_generated, order_sequence, is_required, category)
           VALUES ($1, $2, $3, $4, TRUE, $5, $6, $7)
           RETURNING *`, [
                        user_id,
                        question.question_text,
                        question.question_type,
                        JSON.stringify(question.options || null),
                        nextOrder++,
                        question.is_required,
                        question.category
                    ]);
                    savedQuestions.push(result.rows[0]);
                }
                yield client.query('COMMIT');
                return savedQuestions;
            }
            catch (error) {
                yield client.query('ROLLBACK');
                throw error;
            }
            finally {
                client.release();
            }
        });
    }
    // =================== ANSWER METHODS ===================
    /**
     * Save user answer
     */
    saveAnswer(answer) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query(`INSERT INTO form_answers (user_id, question_id, answer_text, answer_json)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, question_id) 
       DO UPDATE SET answer_text = $3, answer_json = $4, updated_at = CURRENT_TIMESTAMP
       RETURNING *`, [answer.user_id, answer.question_id, answer.answer_text, answer.answer_json]);
            return result.rows[0];
        });
    }
    /**
     * Get all answers for a user
     */
    getUserAnswers(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM form_answers WHERE user_id = $1 ORDER BY created_at', [user_id]);
            return result.rows;
        });
    }
    /**
     * Get answers with questions (for AI context)
     */
    getAnswersWithQuestions(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query(`SELECT 
         fa.answer_text, fa.answer_json,
         fq.question_text, fq.category, fq.question_type
       FROM form_answers fa
       JOIN form_questions fq ON fa.question_id = fq.question_id
       WHERE fa.user_id = $1
       ORDER BY fq.order_sequence`, [user_id]);
            return result.rows;
        });
    }
    /**
     * Get static questions answered by user (for AI generation)
     */
    getStaticAnswersForAI(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query(`SELECT 
         fa.answer_text, fa.answer_json,
         fq.question_text, fq.category, fq.question_type
       FROM form_answers fa
       JOIN form_questions fq ON fa.question_id = fq.question_id
       WHERE fa.user_id = $1 AND fq.is_ai_generated = FALSE
       ORDER BY fq.order_sequence`, [user_id]);
            return result.rows;
        });
    }
    /**
     * Check if user has answered all static questions
     */
    hasCompletedStaticQuestions(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const staticCount = yield this.getStaticQuestionsCount();
            const result = yield pool.query(`SELECT COUNT(*) as answered_count
       FROM form_answers fa
       JOIN form_questions fq ON fa.question_id = fq.question_id
       WHERE fa.user_id = $1 AND fq.is_ai_generated = FALSE`, [user_id]);
            const answeredCount = parseInt(result.rows[0].answered_count);
            return answeredCount >= staticCount;
        });
    }
    /**
     * Get user progress
     */
    getUserProgress(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.getOrCreateFormSession(user_id);
            const totalQuestions = yield this.getAllQuestionsForUser(user_id);
            const answers = yield this.getUserAnswers(user_id);
            return {
                current_step: session.current_step,
                total_steps: session.total_steps,
                questions_answered: answers.length,
                total_questions: totalQuestions.length,
                ai_questions_generated: session.ai_questions_generated,
                is_completed: session.is_completed,
                progress_percentage: Math.round((answers.length / Math.max(totalQuestions.length, 1)) * 100)
            };
        });
    }
}
exports.formService = new FormService();
class CareerOptionsService {
    /**
     * Save multiple career options for a user
     */
    saveCareerOptions(userId, careerOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield pool.connect();
            try {
                yield client.query('BEGIN');
                // First, delete existing career options for this user
                yield client.query('DELETE FROM career_options WHERE user_id = $1', [userId]);
                const savedCareerOptions = [];
                for (const option of careerOptions) {
                    const result = yield client.query(`INSERT INTO career_options 
           (name, description, salary_range_min, salary_range_max, currency, required_skills, growth_rate, user_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`, [
                        option.name,
                        option.description,
                        option.salary_range_min,
                        option.salary_range_max,
                        option.currency || 'INR',
                        option.required_skills,
                        option.growth_rate,
                        userId
                    ]);
                    savedCareerOptions.push(result.rows[0]);
                }
                yield client.query('COMMIT');
                return savedCareerOptions;
            }
            catch (error) {
                yield client.query('ROLLBACK');
                throw error;
            }
            finally {
                client.release();
            }
        });
    }
    /**
     * Get career options for a user
     */
    getCareerOptionsForUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM career_options WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
            return result.rows;
        });
    }
    /**
     * Get career option by ID
     */
    getCareerOptionById(careerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT * FROM career_options WHERE career_id = $1', [careerId]);
            return result.rows[0] || null;
        });
    }
    /**
     * Check if user has career options generated
     */
    hasCareerOptions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield pool.query('SELECT COUNT(*) as count FROM career_options WHERE user_id = $1', [userId]);
            return parseInt(result.rows[0].count) > 0;
        });
    }
}
exports.careerOptionsService = new CareerOptionsService();
exports.default = pool;
