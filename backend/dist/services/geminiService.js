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
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
class GeminiService {
    constructor() {
        this.model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: 'application/json'
            }
        });
    }
    /**
     * Generate AI follow-up questions based on user's previous answers
     * @param previousQA Array of previous question-answer pairs
     * @param numberOfQuestions Number of questions to generate (default: 5)
     * @returns Array of generated questions
     */
    generateFollowUpQuestions(previousQA_1) {
        return __awaiter(this, arguments, void 0, function* (previousQA, numberOfQuestions = 5) {
            try {
                const prompt = this.buildPrompt(previousQA, numberOfQuestions);
                const result = yield this.model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: 'application/json'
                    }
                });
                const response = yield result.response;
                const text = response.text();
                const json = this.toJson(text);
                return this.validateGeneratedQuestions(json);
            }
            catch (error) {
                console.error('Error generating AI questions:', error);
                throw new Error('Failed to generate AI questions');
            }
        });
    }
    buildPrompt(previousQA, numberOfQuestions) {
        const qaContext = previousQA.map((qa, index) => `${index + 1}. Q: ${qa.question}\n   A: ${qa.answer}\n   Category: ${qa.category || 'general'}`).join('\n\n');
        return `
You are a career counseling AI assistant. Based on the user's previous answers to a career assessment form, generate ${numberOfQuestions} insightful follow-up questions that will help provide better career recommendations.

**Previous Questions & Answers:**
${qaContext}

**Instructions:**
1. Generate ${numberOfQuestions} relevant follow-up questions
2. Questions should dig deeper into career interests, values, work style, and aspirations
3. Avoid repeating information already collected
4. Focus on areas that will help determine suitable career paths
5. Make questions specific and actionable

**Response Format (JSON only):**
[
  {
    "question_text": "Your question here",
    "question_type": "text|multiple_choice|checkbox|number|textarea",
    "category": "career_goals|work_style|values|interests|skills|other",
    "options": ["option1", "option2"] // only for multiple_choice
    "is_required": true|false
  }
]

**Question Types Guidelines:**
- text: Short text answers
- textarea: Long text answers
- multiple_choice: Single selection from options
- checkbox: Yes/No questions
- number: Numeric input

**Categories:**
- career_goals: Future aspirations, desired positions
- work_style: How they prefer to work
- values: What's important to them in work
- interests: What excites them professionally
- skills: Abilities they want to develop/use
- other: General career-related questions

Respond with ONLY the JSON array, no additional text.
`;
    }
    /**
     * Validate the generated questions from Gemini
     */
    validateGeneratedQuestions(questions) {
        const validatedQuestions = [];
        questions.forEach((question, index) => {
            // Basic validation
            if (!question.question_text || !question.question_type || !question.category) {
                console.warn(`Skipping invalid question at index ${index}:`, question);
                return;
            }
            // Validate question_type
            const validTypes = ['text', 'multiple_choice', 'checkbox', 'number', 'textarea'];
            if (!validTypes.includes(question.question_type)) {
                question.question_type = 'text'; // Default fallback
            }
            // Ensure multiple_choice has options
            if (question.question_type === 'multiple_choice' && !question.options) {
                question.options = ['Yes', 'No']; // Default fallback
            }
            validatedQuestions.push({
                question_text: question.question_text,
                question_type: question.question_type,
                category: question.category,
                options: question.options,
                is_required: question.is_required !== false // Default to true
            });
        });
        return validatedQuestions;
    }
    /**
     * Generate career recommendations based on all user answers
     * @param allAnswers All question-answer pairs from the complete form
     * @returns Career recommendations
     */
    generateCareerRecommendations(allAnswers) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const prompt = this.buildRecommendationPrompt(allAnswers);
                const result = yield this.model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: 'application/json'
                    }
                });
                const response = yield result.response;
                const text = response.text();
                return this.toJson(text);
            }
            catch (error) {
                console.error('Error generating career recommendations:', error);
                throw new Error('Failed to generate career recommendations');
            }
        });
    }
    /**
     * Generate career options for database storage based on user answers
     * @param allAnswers All question-answer pairs from the complete form
     * @param userId User ID for linking career options
     * @returns Array of career options to be saved in database
     */
    generateCareerOptionsForDB(allAnswers, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const prompt = this.buildCareerOptionsPrompt(allAnswers);
                const result = yield this.model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: 'application/json'
                    }
                });
                const response = yield result.response;
                const text = response.text();
                const careerOptions = this.toJson(text);
                // Add user_id and timestamps to each career option
                return careerOptions.map((option) => (Object.assign(Object.assign({}, option), { user_id: userId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })));
            }
            catch (error) {
                console.error('Error generating career options:', error);
                throw new Error('Failed to generate career options');
            }
        });
    }
    /**
     * Build prompt for career recommendations
     */
    buildRecommendationPrompt(allAnswers) {
        const qaContext = allAnswers.map((qa, index) => `${index + 1}. Q: ${qa.question}\n   A: ${qa.answer}`).join('\n\n');
        return `
Based on the complete career assessment form responses below, provide personalized career recommendations:

**User's Complete Responses:**
${qaContext}

**Please provide:**
1. Top 5 career recommendations with reasons
2. Skills to develop for each career
3. Learning resources or next steps
4. Potential challenges and how to overcome them

**Response Format (JSON):**
{
  "recommendations": [
    {
      "title": "Career Title",
      "description": "Why this career fits",
      "skills_needed": ["skill1", "skill2"],
      "next_steps": ["step1", "step2"],
      "challenges": ["challenge1", "challenge2"],
      "match_percentage": 85
    }
  ],
  "overall_profile": {
    "strengths": ["strength1", "strength2"],
    "areas_to_develop": ["area1", "area2"],
    "work_style": "description"
  }
}

Respond with ONLY the JSON, no additional text.
`;
    }
    /**
     * Build prompt for generating career options to save in database
     */
    buildCareerOptionsPrompt(allAnswers) {
        const qaContext = allAnswers.map((qa, index) => `${index + 1}. Q: ${qa.question}\n   A: ${qa.answer}`).join('\n\n');
        return `
Based on the user's complete career assessment responses, generate 5 personalized career options that would be suitable for this user. These will be saved in a database for the user to explore.

**User's Complete Responses:**
${qaContext}

**Instructions:**
1. Generate 5 career options that best match the user's profile
2. Focus on careers that align with their education, skills, interests, and preferences
3. Include realistic salary ranges in INR for the Indian job market
4. Provide specific skills needed for each career
5. Include growth rate as percentage for job market demand
6. Make descriptions compelling and personalized

**Response Format (JSON Array):**
[
  {
    "name": "Career Title",
    "description": "Detailed description of why this career suits the user based on their responses. Make it personalized and compelling.",
    "salary_range_min": 400000,
    "salary_range_max": 1200000,
    "currency": "INR",
    "required_skills": ["skill1", "skill2", "skill3"],
    "growth_rate": 15.5
  }
]

**Salary Guidelines (INR per annum):**
- Entry level: 300K - 800K
- Mid level: 800K - 2000K
- Senior level: 2000K - 5000K

**Important:** Respond with ONLY the JSON array, no additional text. Ensure all required_skills are relevant to the career and user's background.
`;
    }
    /**
     * Convert LLM text output to JSON robustly (handles code fences and extra text)
     */
    toJson(text) {
        try {
            return JSON.parse(text);
        }
        catch (_) {
            // Strip Markdown code fences if present
            const stripped = text
                .replace(/^```[a-zA-Z]*\n/m, '')
                .replace(/```\s*$/m, '')
                .trim();
            try {
                return JSON.parse(stripped);
            }
            catch (_) {
                // Try to extract first JSON array or object with a lax regex
                const match = stripped.match(/(\[\s*[\s\S]*\]|\{[\s\S]*\})/);
                if (match) {
                    return JSON.parse(match[1]);
                }
                throw new Error('Model did not return valid JSON');
            }
        }
    }
}
exports.default = new GeminiService();
