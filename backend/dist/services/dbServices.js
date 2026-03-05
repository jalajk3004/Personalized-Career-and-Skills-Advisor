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
exports.pool = exports.careerOptionsService = exports.formService = void 0;
const prismaClient_1 = __importDefault(require("./prismaClient"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class FormService {
    // =================== FORM SESSION METHODS ===================
    getOrCreateFormSession(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let session = yield prismaClient_1.default.form_sessions.findFirst({
                    where: { user_id, is_completed: false },
                    orderBy: { created_at: 'desc' }
                });
                if (session) {
                    return session;
                }
                const staticQuestionsCount = yield this.getStaticQuestionsCount();
                const newSession = yield prismaClient_1.default.form_sessions.create({
                    data: {
                        user_id,
                        current_step: 1,
                        total_steps: staticQuestionsCount,
                        ai_questions_generated: false,
                        is_completed: false
                    }
                });
                return newSession;
            }
            catch (error) {
                console.error('Error in getOrCreateFormSession:', error);
                throw error;
            }
        });
    }
    updateFormSession(user_id, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield prismaClient_1.default.form_sessions.findFirst({
                where: { user_id, is_completed: false },
                orderBy: { created_at: 'desc' }
            });
            if (!session)
                throw new Error("No active session found");
            const updated = yield prismaClient_1.default.form_sessions.update({
                where: { session_id: session.session_id },
                data: {
                    current_step: updates.current_step,
                    total_steps: updates.total_steps,
                    ai_questions_generated: updates.ai_questions_generated,
                    is_completed: updates.is_completed,
                    updated_at: new Date()
                }
            });
            return updated;
        });
    }
    // =================== QUESTION METHODS ===================
    getStaticQuestions() {
        return __awaiter(this, void 0, void 0, function* () {
            const questions = yield prismaClient_1.default.form_questions.findMany({
                where: { is_ai_generated: false },
                orderBy: { order_sequence: 'asc' }
            });
            return questions;
        });
    }
    getStaticQuestionsCount() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prismaClient_1.default.form_questions.count({
                where: { is_ai_generated: false }
            });
        });
    }
    getAIQuestions(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const questions = yield prismaClient_1.default.form_questions.findMany({
                where: { user_id, is_ai_generated: true },
                orderBy: { order_sequence: 'asc' }
            });
            return questions;
        });
    }
    getAllQuestionsForUser(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const questions = yield prismaClient_1.default.form_questions.findMany({
                where: {
                    OR: [
                        { is_ai_generated: false },
                        { user_id, is_ai_generated: true }
                    ]
                },
                orderBy: { order_sequence: 'asc' }
            });
            return questions;
        });
    }
    getQuestionById(question_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const question = yield prismaClient_1.default.form_questions.findUnique({
                where: { question_id }
            });
            return question;
        });
    }
    getQuestionsForStep(user_id_1, step_1) {
        return __awaiter(this, arguments, void 0, function* (user_id, step, questionsPerStep = 3) {
            const skip = (step - 1) * questionsPerStep;
            const questions = yield prismaClient_1.default.form_questions.findMany({
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
            return questions;
        });
    }
    saveAIQuestions(user_id, questions) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prismaClient_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const maxOrder = yield tx.form_questions.aggregate({
                    _max: { order_sequence: true }
                });
                let nextOrder = (maxOrder._max.order_sequence || 0) + 1;
                const savedQuestions = [];
                for (const question of questions) {
                    const saved = yield tx.form_questions.create({
                        data: {
                            user_id,
                            question_text: question.question_text,
                            question_type: question.question_type,
                            options: question.options || null,
                            is_ai_generated: true,
                            order_sequence: nextOrder++,
                            is_required: (_a = question.is_required) !== null && _a !== void 0 ? _a : true,
                            category: question.category
                        }
                    });
                    savedQuestions.push(saved);
                }
                return savedQuestions;
            }));
        });
    }
    // =================== ANSWER METHODS ===================
    saveAnswer(answer) {
        return __awaiter(this, void 0, void 0, function* () {
            const saved = yield prismaClient_1.default.form_answers.upsert({
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
            return saved;
        });
    }
    getUserAnswers(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const answers = yield prismaClient_1.default.form_answers.findMany({
                where: { user_id },
                orderBy: { created_at: 'asc' }
            });
            return answers;
        });
    }
    getAnswersWithQuestions(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const answers = yield prismaClient_1.default.form_answers.findMany({
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
            return answers.map((a) => ({
                answer_text: a.answer_text,
                answer_json: a.answer_json,
                question_text: a.form_questions.question_text,
                category: a.form_questions.category,
                question_type: a.form_questions.question_type
            }));
        });
    }
    getStaticAnswersForAI(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const answers = yield prismaClient_1.default.form_answers.findMany({
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
            return answers.map((a) => ({
                answer_text: a.answer_text,
                answer_json: a.answer_json,
                question_text: a.form_questions.question_text,
                category: a.form_questions.category,
                question_type: a.form_questions.question_type
            }));
        });
    }
    hasCompletedStaticQuestions(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const staticCount = yield this.getStaticQuestionsCount();
            const answeredCount = yield prismaClient_1.default.form_answers.count({
                where: {
                    user_id,
                    form_questions: { is_ai_generated: false }
                }
            });
            return answeredCount >= staticCount;
        });
    }
    getUserProgress(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield this.getOrCreateFormSession(user_id);
            const totalQuestionsCount = yield prismaClient_1.default.form_questions.count({
                where: {
                    OR: [
                        { is_ai_generated: false },
                        { user_id, is_ai_generated: true }
                    ]
                }
            });
            const answersCount = yield prismaClient_1.default.form_answers.count({
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
        });
    }
}
exports.formService = new FormService();
class CareerOptionsService {
    saveCareerOptions(userId, careerOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prismaClient_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                yield tx.career_options.deleteMany({
                    where: { user_id: userId }
                });
                const savedOptions = [];
                for (const option of careerOptions) {
                    const saved = yield tx.career_options.create({
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
                return savedOptions;
            }));
        });
    }
    getCareerOptionsForUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = yield prismaClient_1.default.career_options.findMany({
                where: { user_id: userId },
                orderBy: { created_at: 'desc' }
            });
            return options;
        });
    }
    getCareerOptionById(careerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const option = yield prismaClient_1.default.career_options.findUnique({
                where: { career_id: careerId }
            });
            return option;
        });
    }
    hasCareerOptions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield prismaClient_1.default.career_options.count({
                where: { user_id: userId }
            });
            return count > 0;
        });
    }
}
exports.careerOptionsService = new CareerOptionsService();
// Mock pool object for backward compatibility
exports.pool = {
    query: (text, params) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (text.trim().toLowerCase().startsWith('select current_database()')) {
                const res = yield prismaClient_1.default.$queryRawUnsafe(text);
                return { rows: res };
            }
            const res = yield prismaClient_1.default.$queryRawUnsafe(text, ...(params || []));
            return { rows: res };
        }
        catch (error) {
            console.error('❌ Error in mock pool.query:');
            console.error('Query:', text);
            console.error('Params:', params);
            console.error('Error:', error);
            throw error;
        }
    }),
    connect: () => __awaiter(void 0, void 0, void 0, function* () {
        return {
            query: (text, params) => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield prismaClient_1.default.$queryRawUnsafe(text, ...(params || []));
                return { rows: res };
            }),
            release: () => { }
        };
    })
};
exports.default = exports.pool;
