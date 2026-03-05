import prisma from './prismaClient';
import dotenv from 'dotenv';
dotenv.config();

// Interfaces for type safety
export interface Question {
  question_id: number;
  user_id?: number | null;
  question_text: string;
  question_type: string;
  options?: any;
  is_ai_generated: boolean;
  order_sequence: number;
  is_required: boolean;
  category: string;
}

export interface Answer {
  answer_id?: number;
  user_id: number;
  question_id: number;
  answer_text?: string | null;
  answer_json?: any;
}

export interface FormSession {
  session_id?: number;
  user_id: number;
  current_step: number;
  total_steps: number;
  ai_questions_generated: boolean;
  is_completed: boolean;
}

class FormService {

  // =================== FORM SESSION METHODS ===================

  async getOrCreateFormSession(user_id: number): Promise<FormSession> {
    try {
      let session = await prisma.form_sessions.findFirst({
        where: { user_id, is_completed: false },
        orderBy: { created_at: 'desc' }
      });

      if (session) {
        return session as unknown as FormSession;
      }

      const staticQuestionsCount = await this.getStaticQuestionsCount();
      const newSession = await prisma.form_sessions.create({
        data: {
          user_id,
          current_step: 1,
          total_steps: staticQuestionsCount,
          ai_questions_generated: false,
          is_completed: false
        }
      });

      return newSession as unknown as FormSession;
    } catch (error) {
      console.error('Error in getOrCreateFormSession:', error);
      throw error;
    }
  }

  async updateFormSession(user_id: number, updates: Partial<FormSession>): Promise<FormSession> {
    const session = await prisma.form_sessions.findFirst({
      where: { user_id, is_completed: false },
      orderBy: { created_at: 'desc' }
    });

    if (!session) throw new Error("No active session found");

    const updated = await prisma.form_sessions.update({
      where: { session_id: session.session_id },
      data: {
        current_step: updates.current_step,
        total_steps: updates.total_steps,
        ai_questions_generated: updates.ai_questions_generated,
        is_completed: updates.is_completed,
        updated_at: new Date()
      }
    });

    return updated as unknown as FormSession;
  }

  // =================== QUESTION METHODS ===================

  async getStaticQuestions(): Promise<Question[]> {
    const questions = await prisma.form_questions.findMany({
      where: { is_ai_generated: false },
      orderBy: { order_sequence: 'asc' }
    });
    return questions as unknown as Question[];
  }

  async getStaticQuestionsCount(): Promise<number> {
    return await prisma.form_questions.count({
      where: { is_ai_generated: false }
    });
  }

  async getAIQuestions(user_id: number): Promise<Question[]> {
    const questions = await prisma.form_questions.findMany({
      where: { user_id, is_ai_generated: true },
      orderBy: { order_sequence: 'asc' }
    });
    return questions as unknown as Question[];
  }

  async getAllQuestionsForUser(user_id: number): Promise<Question[]> {
    const questions = await prisma.form_questions.findMany({
      where: {
        OR: [
          { is_ai_generated: false },
          { user_id, is_ai_generated: true }
        ]
      },
      orderBy: { order_sequence: 'asc' }
    });
    return questions as unknown as Question[];
  }

  async getQuestionById(question_id: number): Promise<Question | null> {
    const question = await prisma.form_questions.findUnique({
      where: { question_id }
    });
    return question as unknown as Question | null;
  }

  async getQuestionsForStep(user_id: number, step: number, questionsPerStep: number = 3): Promise<Question[]> {
    const skip = (step - 1) * questionsPerStep;
    const questions = await prisma.form_questions.findMany({
      where: {
        OR: [
          { is_ai_generated: false },
          { user_id, is_ai_generated: true }
        ]
      },
      orderBy: { order_sequence: 'asc' },
      skip,
      take: questionsPerStep
    });
    return questions as unknown as Question[];
  }

  async saveAIQuestions(user_id: number, questions: any[]): Promise<Question[]> {
    return await prisma.$transaction(async (tx: any) => {
      const maxOrder = await tx.form_questions.aggregate({
        _max: { order_sequence: true }
      });
      let nextOrder = (maxOrder._max.order_sequence || 0) + 1;

      const savedQuestions = [];
      for (const question of questions) {
        const saved = await tx.form_questions.create({
          data: {
            user_id,
            question_text: question.question_text,
            question_type: question.question_type,
            options: question.options || null,
            is_ai_generated: true,
            order_sequence: nextOrder++,
            is_required: question.is_required ?? true,
            category: question.category
          }
        });
        savedQuestions.push(saved);
      }
      return savedQuestions as unknown as Question[];
    });
  }

  // =================== ANSWER METHODS ===================

  async saveAnswer(answer: Answer): Promise<Answer> {
    const saved = await prisma.form_answers.upsert({
      where: {
        user_id_question_id: {
          user_id: answer.user_id,
          question_id: answer.question_id
        }
      },
      update: {
        answer_text: answer.answer_text,
        answer_json: answer.answer_json,
        updated_at: new Date()
      },
      create: {
        user_id: answer.user_id,
        question_id: answer.question_id,
        answer_text: answer.answer_text,
        answer_json: answer.answer_json
      }
    });
    return saved as unknown as Answer;
  }

  async getUserAnswers(user_id: number): Promise<Answer[]> {
    const answers = await prisma.form_answers.findMany({
      where: { user_id },
      orderBy: { created_at: 'asc' }
    });
    return answers as unknown as Answer[];
  }

  async getAnswersWithQuestions(user_id: number): Promise<any[]> {
    const answers = await prisma.form_answers.findMany({
      where: { user_id },
      include: {
        form_questions: true
      },
      orderBy: {
        form_questions: {
          order_sequence: 'asc'
        }
      }
    });

    return answers.map((a: any) => ({
      answer_text: a.answer_text,
      answer_json: a.answer_json,
      question_text: a.form_questions.question_text,
      category: a.form_questions.category,
      question_type: a.form_questions.question_type
    }));
  }

  async getStaticAnswersForAI(user_id: number): Promise<any[]> {
    const answers = await prisma.form_answers.findMany({
      where: {
        user_id,
        form_questions: { is_ai_generated: false }
      },
      include: {
        form_questions: true
      },
      orderBy: {
        form_questions: {
          order_sequence: 'asc'
        }
      }
    });

    return answers.map((a: any) => ({
      answer_text: a.answer_text,
      answer_json: a.answer_json,
      question_text: a.form_questions.question_text,
      category: a.form_questions.category,
      question_type: a.form_questions.question_type
    }));
  }

  async hasCompletedStaticQuestions(user_id: number): Promise<boolean> {
    const staticCount = await this.getStaticQuestionsCount();
    const answeredCount = await prisma.form_answers.count({
      where: {
        user_id,
        form_questions: { is_ai_generated: false }
      }
    });
    return answeredCount >= staticCount;
  }

  async getUserProgress(user_id: number): Promise<any> {
    const session = await this.getOrCreateFormSession(user_id);
    const totalQuestionsCount = await prisma.form_questions.count({
      where: {
        OR: [
          { is_ai_generated: false },
          { user_id, is_ai_generated: true }
        ]
      }
    });
    const answersCount = await prisma.form_answers.count({
      where: { user_id }
    });

    return {
      current_step: session.current_step,
      total_steps: session.total_steps,
      questions_answered: answersCount,
      total_questions: totalQuestionsCount,
      ai_questions_generated: session.ai_questions_generated,
      is_completed: session.is_completed,
      progress_percentage: Math.round((answersCount / Math.max(totalQuestionsCount, 1)) * 100)
    };
  }
}

export const formService = new FormService();

// =================== CAREER OPTIONS METHODS ===================

export interface CareerOption {
  career_id?: number;
  name: string;
  description: string;
  salary_range_min: number | null;
  salary_range_max: number | null;
  currency: string | null;
  required_skills: string[];
  growth_rate: any | null;
  user_id?: number | null;
}

class CareerOptionsService {
  async saveCareerOptions(userId: number, careerOptions: any[]): Promise<CareerOption[]> {
    return await prisma.$transaction(async (tx: any) => {
      await tx.career_options.deleteMany({
        where: { user_id: userId }
      });

      const savedOptions = [];
      for (const option of careerOptions) {
        const saved = await tx.career_options.create({
          data: {
            name: option.name,
            description: option.description,
            salary_range_min: option.salary_range_min,
            salary_range_max: option.salary_range_max,
            currency: option.currency || 'INR',
            required_skills: option.required_skills,
            growth_rate: option.growth_rate,
            user_id: userId
          }
        });
        savedOptions.push(saved);
      }
      return savedOptions as unknown as CareerOption[];
    });
  }

  async getCareerOptionsForUser(userId: number): Promise<CareerOption[]> {
    const options = await prisma.career_options.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });
    return options as unknown as CareerOption[];
  }

  async getCareerOptionById(careerId: number): Promise<CareerOption | null> {
    const option = await prisma.career_options.findUnique({
      where: { career_id: careerId }
    });
    return option as unknown as CareerOption | null;
  }

  async hasCareerOptions(userId: number): Promise<boolean> {
    const count = await prisma.career_options.count({
      where: { user_id: userId }
    });
    return count > 0;
  }
}

export const careerOptionsService = new CareerOptionsService();

// Mock pool object for backward compatibility
export const pool = {
  query: async (text: string, params?: any[]) => {
    try {
      if (text.trim().toLowerCase().startsWith('select current_database()')) {
        const res = await prisma.$queryRawUnsafe<{ current_database: string }[]>(text);
        return { rows: res };
      }
      const res = await prisma.$queryRawUnsafe<any[]>(text, ...(params || []));
      return { rows: res };
    } catch (error: any) {
      console.error('❌ Error in mock pool.query:');
      console.error('Query:', text);
      console.error('Params:', params);
      console.error('Error:', error);
      throw error;
    }
  },
  connect: async () => {
    return {
      query: async (text: string, params?: any[]) => {
        const res = await prisma.$queryRawUnsafe<any[]>(text, ...(params || []));
        return { rows: res };
      },
      release: () => { }
    };
  }
};

export default pool;
