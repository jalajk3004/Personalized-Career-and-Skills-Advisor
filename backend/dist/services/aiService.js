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
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY,
});
// We recommend using llama-3.3-70b-versatile or llama3-8b-8192
const MODEL_NAME = 'llama-3.3-70b-versatile';
class AIService {
    /**
     * Generate AI follow-up questions based on user's previous answers
     */
    generateFollowUpQuestions(previousQA_1) {
        return __awaiter(this, arguments, void 0, function* (previousQA, numberOfQuestions = 5) {
            var _a, _b;
            try {
                const prompt = this.buildFollowUpQuestionsPrompt(previousQA, numberOfQuestions);
                const completion = yield groq.chat.completions.create({
                    messages: [{ role: 'user', content: prompt }],
                    model: MODEL_NAME,
                    temperature: 0.7,
                    response_format: { type: 'json_object' } // Groq supports JSON mode
                });
                const text = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '{}';
                // As we are forcing JSON object, we wrap the expected array prompt output into an object
                // wait, the prompt asks for an array. Let's adjust the prompt to return an object with a "questions" array.
                const json = JSON.parse(text);
                return this.validateGeneratedQuestions(json.questions || []);
            }
            catch (error) {
                console.error('Error generating AI questions:', error);
                throw new Error('Failed to generate AI questions');
            }
        });
    }
    /**
     * Generate a comprehensive career roadmap for a specific career path
     */
    generateCareerRoadmap(career, userData, allAnswers) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const prompt = this.buildRoadmapPrompt(career, userData, allAnswers);
                const completion = yield groq.chat.completions.create({
                    messages: [{ role: 'user', content: prompt }],
                    model: MODEL_NAME,
                    temperature: 0.7,
                    response_format: { type: 'json_object' }
                });
                const text = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '{}';
                const roadmap = JSON.parse(text);
                return this.validateRoadmap(roadmap, career);
            }
            catch (error) {
                console.error('Error generating career roadmap:', error);
                if (error instanceof Error && error.message.includes('JSON')) {
                    return this.validateRoadmap(null, career);
                }
                throw new Error('Failed to generate career roadmap');
            }
        });
    }
    /**
     * Generate career recommendations based on all user answers
     */
    generateCareerRecommendations(allAnswers) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const prompt = this.buildRecommendationPrompt(allAnswers);
                const completion = yield groq.chat.completions.create({
                    messages: [{ role: 'user', content: prompt }],
                    model: MODEL_NAME,
                    temperature: 0.7,
                    response_format: { type: 'json_object' }
                });
                const text = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '{}';
                return JSON.parse(text);
            }
            catch (error) {
                console.error('Error generating career recommendations:', error);
                throw new Error('Failed to generate career recommendations');
            }
        });
    }
    /**
     * Generate career options for database storage based on user answers
     */
    generateCareerOptionsForDB(allAnswers, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const prompt = this.buildCareerOptionsPrompt(allAnswers);
                const completion = yield groq.chat.completions.create({
                    messages: [{ role: 'user', content: prompt }],
                    model: MODEL_NAME,
                    temperature: 0.7,
                    response_format: { type: 'json_object' }
                });
                const text = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '{}';
                const json = JSON.parse(text);
                const careerOptions = json.options || [];
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
     * Build prompt for follow-up questions
     */
    buildFollowUpQuestionsPrompt(previousQA, numberOfQuestions) {
        const qaContext = previousQA.map((qa, index) => `${index + 1}. Q: ${qa.question}\n   A: ${qa.answer}\n   Category: ${qa.category || 'general'}`).join('\n\n');
        return `
You are an expert career counseling AI. Based on the user's previous responses, generate ${numberOfQuestions} strategic follow-up questions that will reveal deeper insights about their career potential and preferences.

**Current Assessment Data:**
${qaContext}

**Your Mission:**
Generate questions that uncover:
- Hidden talents and natural aptitudes
- Core values and motivations
- Work environment preferences
- Leadership and collaboration styles
- Career growth aspirations
- Risk tolerance and adaptability
- Industry-specific interests

**Response Format (JSON only):**
{
  "questions": [
    {
      "question_text": "Your compelling question here",
      "question_type": "text|multiple_choice|checkbox|number|textarea",
      "category": "career_goals|work_style|values|interests|skills|personality|growth",
      "options": ["option1", "option2", "option3"], // only for multiple_choice, 2-4 options max
      "is_required": true
    }
  ]
}

**Question Type Guidelines:**
- text: For short, specific answers (names, titles, brief descriptions)
- textarea: For detailed explanations or stories
- multiple_choice: For selecting from predefined options (2-4 choices)
- checkbox: For yes/no or binary choices
- number: For ratings, years of experience, etc.

Return ONLY the JSON object.
`;
    }
    /**
     * Build prompt for career roadmap generation
     */
    buildRoadmapPrompt(career, userData, allAnswers) {
        const userProfile = `
**User Profile:**
- Name: ${userData.name}
- Age: ${userData.age}
- Education: ${userData.highschool_name ? `${userData.highschool_name} (${userData.highschool_stream})` : 'Not specified'}
- College: ${userData.college || 'Not specified'}
- Course: ${userData.course || 'Not specified'} ${userData.specialisation ? `(${userData.specialisation})` : ''}
- Current Experience: ${userData.no_experience ? 'No experience' : `${userData.job_title} at ${userData.company_name} (${userData.duration})`}
- Skills: ${userData.skills || 'Not specified'}
- Interests: ${userData.interests || 'Not specified'}
- Work Environment: ${userData.preferred_work_env || 'Not specified'}
`;
        const additionalContext = allAnswers ? `
**Additional Assessment Insights:**
${allAnswers.map((qa, index) => `${index + 1}. Q: ${qa.question}\n   A: ${qa.answer}`).join('\n\n')}
` : '';
        return `
You are a senior career strategist creating a personalized roadmap for "${career}".

${userProfile}
${additionalContext}

**Roadmap Requirements:**
1. Create 6-8 progressive steps spanning 2-3 years
2. Each step should build upon the previous one
3. Include specific, actionable sub-steps (2-3 per step)
4. Consider the user's current level and background
5. Include skill development, networking, and experience-building

**Response Format (JSON only):**
{
  "career": "${career}",
  "estimated_timeline": "18-24 months",
  "difficulty_level": "Beginner|Intermediate|Advanced",
  "roadmap": [
    {
      "step": "Clear, actionable step title",
      "description": "Detailed explanation of what to do and why it's important for this specific user",
      "duration": "2-4 weeks|1-2 months|3-6 months",
      "key_outcomes": [
        "What they'll achieve after completing this step"
      ]
    }
  ]
}

Return ONLY the JSON object.
`;
    }
    /**
     * Build prompt for career recommendations
     */
    buildRecommendationPrompt(allAnswers) {
        const qaContext = allAnswers.map((qa, index) => `${index + 1}. Q: ${qa.question}\n   A: ${qa.answer}`).join('\n\n');
        return `
You are an expert career counselor with deep knowledge of the Indian job market. Analyze the comprehensive assessment data below and provide personalized career recommendations.

**Complete User Assessment:**
${qaContext}

**Response Format (JSON only):**
{
  "user_profile_summary": {
    "key_strengths": ["strength1", "strength2", "strength3"],
    "core_interests": ["interest1", "interest2", "interest3"],
    "work_style": "Brief description of their ideal work style",
    "career_readiness": "Assessment of their preparation level"
  },
  "recommendations": [
    {
      "title": "Specific Career Title",
      "description": "Why this career is an excellent match based on their specific responses",
      "match_percentage": 85,
      "salary_range_inr": "4-12 LPA",
      "growth_potential": "High|Medium|Stable",
      "required_skills": ["skill1", "skill2", "skill3"],
      "next_steps": [
        "Immediate action they should take",
        "Medium-term goal"
      ],
      "potential_challenges": [
        "Challenge they might face"
      ],
      "success_indicators": [
        "Sign they're on the right track"
      ]
    }
  ],
  "development_priorities": [
    {
      "area": "Skill/knowledge area to focus on",
      "importance": "High|Medium|Low",
      "timeline": "3 months|6 months|1 year",
      "resources": ["Specific learning resource", "Another resource"]
    }
  ],
  "market_insights": {
    "trending_sectors": ["sector1", "sector2"],
    "emerging_opportunities": "Brief note on new opportunities",
    "location_advantage": "How their location affects opportunities"
  }
}

Return ONLY the JSON object.
`;
    }
    /**
     * Build prompt for generating career options to save in database
     */
    buildCareerOptionsPrompt(allAnswers) {
        const qaContext = allAnswers.map((qa, index) => `${index + 1}. Q: ${qa.question}\n   A: ${qa.answer}`).join('\n\n');
        return `
Based on the comprehensive career assessment responses, generate 5 highly personalized career options optimized for the Indian job market. These will be stored in a database for detailed exploration.

**Complete User Assessment:**
${qaContext}

**Response Format (JSON only):**
{
  "options": [
    {
      "name": "Precise Career Title",
      "description": "Compelling, personalized description explaining why this career perfectly suits this specific user based on their assessment responses.",
      "salary_range_min": 500000,
      "salary_range_max": 1500000,
      "currency": "INR",
      "experience_level": "Entry|Mid|Senior",
      "required_skills": [
        "Core technical skill",
        "Important soft skill"
      ],
      "growth_rate": 18.5,
      "industry_sector": "Technology|Healthcare|Finance|Education|Marketing|Consulting|Manufacturing|Other",
      "work_environment": "Office|Remote|Hybrid|Field|Creative Studio",
      "education_match": "How well it matches their educational background (1-10 scale)",
      "key_responsibilities": [
        "Primary responsibility",
        "Secondary responsibility"
      ]
    }
  ]
}

Return ONLY the JSON object.
`;
    }
    validateGeneratedQuestions(questions) {
        const validatedQuestions = [];
        questions.forEach((question, index) => {
            if (!question.question_text || !question.question_type || !question.category) {
                return;
            }
            const validTypes = ['text', 'multiple_choice', 'checkbox', 'number', 'textarea'];
            if (!validTypes.includes(question.question_type)) {
                question.question_type = 'text';
            }
            if (question.question_type === 'multiple_choice' && !question.options) {
                question.options = ['Yes', 'No'];
            }
            validatedQuestions.push({
                question_text: question.question_text,
                question_type: question.question_type,
                category: question.category,
                options: question.options,
                is_required: question.is_required !== false
            });
        });
        return validatedQuestions;
    }
    validateRoadmap(roadmap, career) {
        const fallbackRoadmap = {
            career: career,
            roadmap: [
                {
                    step: "Foundation Building",
                    description: `Establish core knowledge and skills required for ${career}. Focus on understanding the fundamentals and building a strong base.`,
                    duration: "2-4 weeks",
                    key_outcomes: ["Clear understanding of career requirements", "Learning plan established"]
                },
                {
                    step: "Skill Development",
                    description: `Develop technical and soft skills through structured learning programs and hands-on practice.`,
                    duration: "1-2 months",
                    key_outcomes: ["Core skills developed", "Practical experience gained"]
                },
                {
                    step: "Practical Application",
                    description: `Apply your skills through real-world projects and build a portfolio to showcase your capabilities.`,
                    duration: "2-3 months",
                    key_outcomes: ["Portfolio created", "Real-world experience"]
                }
            ]
        };
        if (!roadmap || typeof roadmap !== 'object') {
            return fallbackRoadmap;
        }
        if (!roadmap.career || !Array.isArray(roadmap.roadmap)) {
            return fallbackRoadmap;
        }
        const validatedSteps = [];
        roadmap.roadmap.forEach((step) => {
            if (step && step.step && step.description) {
                validatedSteps.push({
                    step: step.step,
                    description: step.description,
                });
            }
        });
        return validatedSteps.length > 0 ? {
            career: roadmap.career || career,
            roadmap: validatedSteps
        } : fallbackRoadmap;
    }
}
exports.default = new AIService();
