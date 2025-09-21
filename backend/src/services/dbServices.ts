import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// Enhanced database configuration with better error handling
const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 20,
};

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

console.log('🔧 Database configuration:', {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database,
  ssl: dbConfig.ssl ? 'enabled' : 'disabled',
  environment: process.env.NODE_ENV || 'development'
});

const pool = new Pool(dbConfig);

pool.on('connect', (client) => {
  console.log('✅ Connected to the database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

pool.on('remove', () => {
  console.log('🔌 Database connection removed');
});

// Interfaces for type safety
interface Question {
  question_id: number;
  user_id?: number;
  question_text: string;
  question_type: string;
  options?: any;
  is_ai_generated: boolean;
  order_sequence: number;
  is_required: boolean;
  category: string;
}

interface Answer {
  answer_id?: number;
  user_id: number;
  question_id: number;
  answer_text?: string;
  answer_json?: any;
}

interface FormSession {
  session_id?: number;
  user_id: number;
  current_step: number;
  total_steps: number;
  ai_questions_generated: boolean;
  is_completed: boolean;
}

class FormService {
  
  // =================== FORM SESSION METHODS ===================
  
  /**
   * Get or create form session for user
   */
  async getOrCreateFormSession(user_id: number): Promise<FormSession> {
    try {
      // Try to get existing session
      let result = await pool.query(
        'SELECT * FROM form_sessions WHERE user_id = $1 AND is_completed = FALSE ORDER BY created_at DESC LIMIT 1',
        [user_id]
      );
      
      if (result.rows.length > 0) {
        return result.rows[0];
      }
      
      // Create new session
      const staticQuestionsCount = await this.getStaticQuestionsCount();
      result = await pool.query(
        `INSERT INTO form_sessions (user_id, current_step, total_steps, ai_questions_generated, is_completed) 
         VALUES ($1, 1, $2, FALSE, FALSE) RETURNING *`,
        [user_id, staticQuestionsCount]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in getOrCreateFormSession:', error);
      throw error;
    }
  }
  
  /**
   * Update form session
   */
  async updateFormSession(user_id: number, updates: Partial<FormSession>): Promise<FormSession> {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [user_id, ...Object.values(updates)];
    
    const result = await pool.query(
      `UPDATE form_sessions SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND is_completed = FALSE RETURNING *`,
      values
    );
    
    return result.rows[0];
  }
  
  // =================== QUESTION METHODS ===================
  
  /**
   * Get static questions (predefined questions)
   */
  async getStaticQuestions(): Promise<Question[]> {
    const result = await pool.query(
      'SELECT * FROM form_questions WHERE is_ai_generated = FALSE ORDER BY order_sequence'
    );
    return result.rows;
  }
  
  /**
   * Get count of static questions
   */
  async getStaticQuestionsCount(): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM form_questions WHERE is_ai_generated = FALSE'
    );
    return parseInt(result.rows[0].count);
  }
  
  /**
   * Get AI-generated questions for a user
   */
  async getAIQuestions(user_id: number): Promise<Question[]> {
    const result = await pool.query(
      'SELECT * FROM form_questions WHERE user_id = $1 AND is_ai_generated = TRUE ORDER BY order_sequence',
      [user_id]
    );
    return result.rows;
  }
  
  /**
   * Get all questions for a user (static + AI)
   */
  async getAllQuestionsForUser(user_id: number): Promise<Question[]> {
    const result = await pool.query(
      `SELECT * FROM form_questions 
       WHERE (is_ai_generated = FALSE) OR (user_id = $1 AND is_ai_generated = TRUE)
       ORDER BY order_sequence`,
      [user_id]
    );
    return result.rows;
  }
  
  /**
   * Get single question by ID
   */
  async getQuestionById(question_id: number): Promise<Question | null> {
    const result = await pool.query(
      'SELECT * FROM form_questions WHERE question_id = $1',
      [question_id]
    );
    return result.rows[0] || null;
  }
  
  /**
   * Get questions for current step
   */
  async getQuestionsForStep(user_id: number, step: number, questionsPerStep: number = 3): Promise<Question[]> {
    const offset = (step - 1) * questionsPerStep;
    
    const result = await pool.query(
      `SELECT * FROM form_questions 
       WHERE (is_ai_generated = FALSE) OR (user_id = $1 AND is_ai_generated = TRUE)
       ORDER BY order_sequence
       LIMIT $2 OFFSET $3`,
      [user_id, questionsPerStep, offset]
    );
    return result.rows;
  }
  
  /**
   * Save AI-generated questions for a user
   */
  async saveAIQuestions(user_id: number, questions: any[]): Promise<Question[]> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const savedQuestions: Question[] = [];
      
      // Get the highest order_sequence to continue numbering
      const maxOrderResult = await client.query(
        'SELECT COALESCE(MAX(order_sequence), 0) as max_order FROM form_questions'
      );
      let nextOrder = maxOrderResult.rows[0].max_order + 1;
      
      for (const question of questions) {
        const result = await client.query(
          `INSERT INTO form_questions 
           (user_id, question_text, question_type, options, is_ai_generated, order_sequence, is_required, category)
           VALUES ($1, $2, $3, $4, TRUE, $5, $6, $7)
           RETURNING *`,
          [
            user_id,
            question.question_text,
            question.question_type,
            JSON.stringify(question.options || null),
            nextOrder++,
            question.is_required,
            question.category
          ]
        );
        savedQuestions.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      return savedQuestions;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  // =================== ANSWER METHODS ===================
  
  /**
   * Save user answer
   */
  async saveAnswer(answer: Answer): Promise<Answer> {
    const result = await pool.query(
      `INSERT INTO form_answers (user_id, question_id, answer_text, answer_json)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, question_id) 
       DO UPDATE SET answer_text = $3, answer_json = $4, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [answer.user_id, answer.question_id, answer.answer_text, answer.answer_json]
    );
    return result.rows[0];
  }
  
  /**
   * Get all answers for a user
   */
  async getUserAnswers(user_id: number): Promise<Answer[]> {
    const result = await pool.query(
      'SELECT * FROM form_answers WHERE user_id = $1 ORDER BY created_at',
      [user_id]
    );
    return result.rows;
  }
  
  /**
   * Get answers with questions (for AI context)
   */
  async getAnswersWithQuestions(user_id: number): Promise<any[]> {
    const result = await pool.query(
      `SELECT 
         fa.answer_text, fa.answer_json,
         fq.question_text, fq.category, fq.question_type
       FROM form_answers fa
       JOIN form_questions fq ON fa.question_id = fq.question_id
       WHERE fa.user_id = $1
       ORDER BY fq.order_sequence`,
      [user_id]
    );
    return result.rows;
  }
  
  /**
   * Get static questions answered by user (for AI generation)
   */
  async getStaticAnswersForAI(user_id: number): Promise<any[]> {
    const result = await pool.query(
      `SELECT 
         fa.answer_text, fa.answer_json,
         fq.question_text, fq.category, fq.question_type
       FROM form_answers fa
       JOIN form_questions fq ON fa.question_id = fq.question_id
       WHERE fa.user_id = $1 AND fq.is_ai_generated = FALSE
       ORDER BY fq.order_sequence`,
      [user_id]
    );
    return result.rows;
  }
  
  /**
   * Check if user has answered all static questions
   */
  async hasCompletedStaticQuestions(user_id: number): Promise<boolean> {
    const staticCount = await this.getStaticQuestionsCount();
    
    const result = await pool.query(
      `SELECT COUNT(*) as answered_count
       FROM form_answers fa
       JOIN form_questions fq ON fa.question_id = fq.question_id
       WHERE fa.user_id = $1 AND fq.is_ai_generated = FALSE`,
      [user_id]
    );
    
    const answeredCount = parseInt(result.rows[0].answered_count);
    return answeredCount >= staticCount;
  }
  
  /**
   * Get user progress
   */
  async getUserProgress(user_id: number): Promise<any> {
    const session = await this.getOrCreateFormSession(user_id);
    const totalQuestions = await this.getAllQuestionsForUser(user_id);
    const answers = await this.getUserAnswers(user_id);
    
    return {
      current_step: session.current_step,
      total_steps: session.total_steps,
      questions_answered: answers.length,
      total_questions: totalQuestions.length,
      ai_questions_generated: session.ai_questions_generated,
      is_completed: session.is_completed,
      progress_percentage: Math.round((answers.length / Math.max(totalQuestions.length, 1)) * 100)
    };
  }
}

export const formService = new FormService();

// =================== CAREER OPTIONS METHODS ===================

interface CareerOption {
  career_id?: number;
  name: string;
  description: string;
  salary_range_min: number;
  salary_range_max: number;
  currency: string;
  required_skills: string[];
  growth_rate: number;
  user_id?: number;
}

class CareerOptionsService {
  
  /**
   * Save multiple career options for a user
   */
  async saveCareerOptions(userId: number, careerOptions: any[]): Promise<CareerOption[]> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // First, delete existing career options for this user
      await client.query('DELETE FROM career_options WHERE user_id = $1', [userId]);
      
      const savedCareerOptions: CareerOption[] = [];
      
      for (const option of careerOptions) {
        const result = await client.query(
          `INSERT INTO career_options 
           (name, description, salary_range_min, salary_range_max, currency, required_skills, growth_rate, user_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [
            option.name,
            option.description,
            option.salary_range_min,
            option.salary_range_max,
            option.currency || 'INR',
            option.required_skills,
            option.growth_rate,
            userId
          ]
        );
        savedCareerOptions.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      return savedCareerOptions;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  /**
   * Get career options for a user
   */
  async getCareerOptionsForUser(userId: number): Promise<CareerOption[]> {
    const result = await pool.query(
      'SELECT * FROM career_options WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  }
  
  /**
   * Get career option by ID
   */
  async getCareerOptionById(careerId: number): Promise<CareerOption | null> {
    const result = await pool.query(
      'SELECT * FROM career_options WHERE career_id = $1',
      [careerId]
    );
    return result.rows[0] || null;
  }
  
  /**
   * Check if user has career options generated
   */
  async hasCareerOptions(userId: number): Promise<boolean> {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM career_options WHERE user_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].count) > 0;
  }
}

export const careerOptionsService = new CareerOptionsService();
export default pool;
