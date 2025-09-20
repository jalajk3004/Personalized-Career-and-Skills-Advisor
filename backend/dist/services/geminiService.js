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
                const prompt = this.buildFollowUpQuestionsPrompt(previousQA, numberOfQuestions);
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
    /**
     * Generate a comprehensive career roadmap for a specific career path
     * @param career The career title/name
     * @param userData User profile data including education, skills, experience
     * @param allAnswers Optional: All question-answer pairs for additional context
     * @returns Detailed career roadmap with progressive steps
     */
    generateCareerRoadmap(career, userData, allAnswers) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const prompt = this.buildRoadmapPrompt(career, userData, allAnswers);
                const result = yield this.model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: 'application/json'
                    }
                });
                const response = yield result.response;
                const text = response.text();
                const roadmap = this.toJson(text);
                // Validate and ensure proper structure
                return this.validateRoadmap(roadmap, career);
            }
            catch (error) {
                console.error('Error generating career roadmap:', error);
                // If it's a JSON parsing error, provide a fallback roadmap
                if (error instanceof Error && error.message.includes('JSON')) {
                    return this.validateRoadmap(null, career);
                }
                throw new Error('Failed to generate career roadmap');
            }
        });
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
     * Build prompt for follow-up questions (refined)
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

**Quality Standards:**
1. Each question should reveal NEW information not already covered
2. Questions should be engaging and thought-provoking
3. Avoid generic questions - make them specific and insightful
4. Focus on behavioral indicators and situational preferences
5. Help identify both obvious and non-obvious career matches

**Response Format (JSON only):**
[
  {
    "question_text": "Your compelling question here",
    "question_type": "text|multiple_choice|checkbox|number|textarea",
    "category": "career_goals|work_style|values|interests|skills|personality|growth",
    "options": ["option1", "option2", "option3"] // only for multiple_choice, 2-4 options max
    "is_required": true|false
  }
]

**Question Type Guidelines:**
- text: For short, specific answers (names, titles, brief descriptions)
- textarea: For detailed explanations or stories
- multiple_choice: For selecting from predefined options (2-4 choices)
- checkbox: For yes/no or binary choices
- number: For ratings, years of experience, etc.

**Enhanced Categories:**
- career_goals: Long-term aspirations, desired impact
- work_style: Collaboration, independence, structure preferences
- values: What drives them professionally
- interests: What energizes and excites them
- skills: Abilities they want to leverage or develop
- personality: Natural tendencies and behavioral preferences
- growth: Learning style and development priorities

Return ONLY the JSON array with no additional commentary.
`;
    }
    /**
     * Build prompt for career roadmap generation (enhanced)
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
6. Address potential challenges and how to overcome them
7. Make it realistic for the Indian job market context

**Step Categories to Include:**
- Foundation building (skills, knowledge)
- Practical application (projects, certifications)
- Network building (professional connections)
- Experience gaining (internships, entry-level roles)
- Skill specialization and advancement
- Leadership and growth opportunities

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

**Critical JSON Formatting Requirements:**
- Return ONLY valid JSON - no markdown, no code blocks, no explanations
- Ensure all strings are properly quoted with double quotes
- Include commas between all array elements and object properties
- No trailing commas after the last element
- Escape any quotes within string values using backslash
- Ensure all brackets and braces are properly closed

**Important Guidelines:**
- Personalize based on user's background and current situation
- Include specific tools, platforms, and resources relevant to "${career}"
- Consider Indian market dynamics and opportunities
- Make recommendations realistic and achievable
- Focus on practical skills over theoretical knowledge

**CRITICAL: Return ONLY the JSON object. No additional text, no markdown formatting, no explanations.**
`;
    }
    /**
     * Build prompt for career recommendations (refined)
     */
    buildRecommendationPrompt(allAnswers) {
        const qaContext = allAnswers.map((qa, index) => `${index + 1}. Q: ${qa.question}\n   A: ${qa.answer}`).join('\n\n');
        return `
You are an expert career counselor with deep knowledge of the Indian job market. Analyze the comprehensive assessment data below and provide personalized career recommendations.

**Complete User Assessment:**
${qaContext}

**Analysis Framework:**
1. Identify patterns in interests, skills, and values
2. Match personality traits with suitable work environments
3. Consider education background and experience level
4. Factor in career growth potential and market demand
5. Account for salary expectations and lifestyle preferences

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
        "Medium-term goal",
        "Long-term objective"
      ],
      "potential_challenges": [
        "Challenge they might face",
        "Another potential obstacle"
      ],
      "success_indicators": [
        "Sign they're on the right track",
        "Milestone to aim for"
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

**Quality Standards:**
- Provide 5 diverse career recommendations
- Base all recommendations on specific assessment responses
- Include both traditional and emerging career paths
- Consider remote work opportunities
- Factor in Indian market conditions and salary ranges

Return ONLY the JSON object with comprehensive, personalized insights.
`;
    }
    /**
     * Build prompt for generating career options to save in database (refined)
     */
    buildCareerOptionsPrompt(allAnswers) {
        const qaContext = allAnswers.map((qa, index) => `${index + 1}. Q: ${qa.question}\n   A: ${qa.answer}`).join('\n\n');
        return `
Based on the comprehensive career assessment responses, generate 5 highly personalized career options optimized for the Indian job market. These will be stored in a database for detailed exploration.

**Complete User Assessment:**
${qaContext}

**Generation Criteria:**
1. Match user's education, skills, and interests precisely
2. Consider their experience level and career stage
3. Include diverse options across different sectors
4. Ensure realistic salary ranges for Indian market
5. Focus on careers with good growth potential
6. Include both traditional and emerging career paths

**Response Format (JSON Array only):**
[
  {
    "name": "Precise Career Title (matching industry standards)",
    "description": "Compelling, personalized description explaining why this career perfectly suits this specific user based on their assessment responses. Highlight the connection between their answers and this career choice.",
    "salary_range_min": 500000,
    "salary_range_max": 1500000,
    "currency": "INR",
    "experience_level": "Entry|Mid|Senior",
    "required_skills": [
      "Core technical skill",
      "Important soft skill",
      "Industry-specific skill",
      "Emerging technology/trend"
    ],
    "growth_rate": 18.5,
    "industry_sector": "Technology|Healthcare|Finance|Education|Marketing|Consulting|Manufacturing|Other",
    "work_environment": "Office|Remote|Hybrid|Field|Creative Studio",
    "education_match": "How well it matches their educational background (1-10 scale)",
    "key_responsibilities": [
      "Primary responsibility",
      "Secondary responsibility",
      "Growth-oriented responsibility"
    ]
  }
]

**Indian Market Salary Guidelines (Annual):**
- Fresh Graduate: ₹3-8 LPA
- 1-3 Years Experience: ₹6-15 LPA  
- 3-5 Years Experience: ₹12-25 LPA
- 5+ Years Experience: ₹20-50+ LPA
- Tier-1 Cities: 20-30% premium
- Tech/Finance: Higher ranges
- Startups vs MNCs: Variable ranges

**Quality Requirements:**
- Make descriptions highly specific to the user's responses
- Use realistic salary ranges based on location and experience
- Include mix of stable and high-growth careers
- Ensure required_skills are directly applicable
- Consider remote work trends post-COVID
- Factor in emerging technologies and market trends

Return ONLY the JSON array with no additional text or commentary.
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
     * Validate and ensure proper roadmap structure
     */
    validateRoadmap(roadmap, career) {
        // Provide comprehensive fallback structure if validation fails
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
                },
                {
                    step: "Network Building",
                    description: `Build professional connections and establish your presence in the industry community.`,
                    duration: "1-2 months",
                    key_outcomes: ["Professional network established", "Industry visibility"]
                },
                {
                    step: "Experience Gaining",
                    description: `Gain practical work experience through internships, freelance work, or entry-level positions.`,
                    duration: "3-6 months",
                    key_outcomes: ["Work experience gained", "Industry connections"]
                },
                {
                    step: "Professional Entry",
                    description: `Transition into full-time professional roles and establish your career momentum.`,
                    duration: "2-4 months",
                    key_outcomes: ["Full-time position secured", "Career established"]
                }
            ]
        };
        // Validate the structure
        if (!roadmap || typeof roadmap !== 'object') {
            return fallbackRoadmap;
        }
        // Ensure required fields exist
        if (!roadmap.career || !Array.isArray(roadmap.roadmap)) {
            return fallbackRoadmap;
        }
        // Validate roadmap steps
        const validatedSteps = [];
        roadmap.roadmap.forEach((step) => {
            if (step && step.step && step.description) {
                validatedSteps.push({
                    step: step.step,
                    description: step.description,
                });
            }
        });
        // Return validated roadmap or fallback if no valid steps
        return validatedSteps.length > 0 ? {
            career: roadmap.career || career,
            roadmap: validatedSteps
        } : fallbackRoadmap;
    }
    /**
     * Convert LLM text output to JSON robustly (handles code fences and extra text)
     */
    toJson(text) {
        try {
            return JSON.parse(text);
        }
        catch (error) {
            // Strip Markdown code fences if present
            let cleaned = text
                .replace(/^```[a-zA-Z]*\n/m, '')
                .replace(/```\s*$/m, '')
                .trim();
            try {
                return JSON.parse(cleaned);
            }
            catch (error) {
                // Try to fix common JSON issues
                cleaned = this.fixCommonJsonIssues(cleaned);
                try {
                    return JSON.parse(cleaned);
                }
                catch (error) {
                    // Try to extract JSON object/array with more sophisticated regex
                    const jsonMatch = this.extractJsonFromText(cleaned);
                    if (jsonMatch) {
                        try {
                            return JSON.parse(jsonMatch);
                        }
                        catch (error) {
                            console.error('Extracted JSON still invalid:', error);
                        }
                    }
                    console.error('All JSON parsing attempts failed. Raw text:', text);
                    throw new Error(`Model did not return valid JSON. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
        }
    }
    /**
     * Fix common JSON issues in AI responses
     */
    fixCommonJsonIssues(text) {
        return text
            // Fix trailing commas
            .replace(/,(\s*[}\]])/g, '$1')
            // Fix missing commas between array elements
            .replace(/\]\s*\[/g, '],[')
            // Fix missing commas between object properties
            .replace(/}\s*{/g, '},{')
            // Fix unescaped quotes in strings (basic fix)
            .replace(/"([^"]*)"([^"]*)"([^"]*)":/g, '"$1\\"$2\\"$3":')
            // Remove any text before the first { or [
            .replace(/^[^{[]*/, '')
            // Remove any text after the last } or ]
            .replace(/[^}\]]*$/, '')
            .trim();
    }
    /**
     * Extract JSON from text using multiple strategies
     */
    extractJsonFromText(text) {
        // Strategy 1: Find complete JSON object
        const objectMatch = text.match(/\{[\s\S]*\}/);
        if (objectMatch) {
            return objectMatch[0];
        }
        // Strategy 2: Find complete JSON array
        const arrayMatch = text.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
            return arrayMatch[0];
        }
        // Strategy 3: Try to find JSON between specific markers
        const markers = [
            /```json\s*([\s\S]*?)\s*```/,
            /```\s*([\s\S]*?)\s*```/,
            /"roadmap":\s*(\[[\s\S]*?\])/,
            /"career":\s*"[^"]*",\s*"roadmap":\s*(\[[\s\S]*?\])/
        ];
        for (const marker of markers) {
            const match = text.match(marker);
            if (match) {
                return match[1] || match[0];
            }
        }
        return null;
    }
}
exports.default = new GeminiService();
