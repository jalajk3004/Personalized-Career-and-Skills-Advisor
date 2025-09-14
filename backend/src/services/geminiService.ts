import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface QuestionAnswer {
  question: string;
  answer: string;
  category?: string;
}

interface GeneratedQuestion {
  question_text: string;
  question_type: 'text' | 'multiple_choice' | 'checkbox' | 'number' | 'textarea';
  category: string;
  options?: string[];
  is_required: boolean;
}

interface CareerData {
  name: string;
  age: number;
  highschool_name?: string;
  highschool_stream?: string;
  college?: string;
  course_type?: string;
  course?: string;
  specialisation?: string;
  no_experience?: boolean;
  job_title?: string;
  company_name?: string;
  duration?: string;
  skills?: string;
  interests?: string;
  preferred_work_env?: string;
}

class GeminiService {
  private model;

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
  async generateFollowUpQuestions(
    previousQA: QuestionAnswer[], 
    numberOfQuestions: number = 5
  ): Promise<GeneratedQuestion[]> {
    try {
      const prompt = this.buildPrompt(previousQA, numberOfQuestions);
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }]}],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });
      const response = await result.response;
      const text = response.text();

      const json = this.toJson(text);
      
      return this.validateGeneratedQuestions(json as any[]);
      
    } catch (error) {
      console.error('Error generating AI questions:', error);
      throw new Error('Failed to generate AI questions');
    }
  }

  
  private buildPrompt(previousQA: QuestionAnswer[], numberOfQuestions: number): string {
    const qaContext = previousQA.map((qa, index) => 
      `${index + 1}. Q: ${qa.question}\n   A: ${qa.answer}\n   Category: ${qa.category || 'general'}`
    ).join('\n\n');

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
  private validateGeneratedQuestions(questions: any[]): GeneratedQuestion[] {
    const validatedQuestions: GeneratedQuestion[] = [];
    
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
  async generateCareerRecommendations(allAnswers: QuestionAnswer[]): Promise<any> {
    try {
      const prompt = this.buildRecommendationPrompt(allAnswers);
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }]}],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });
      const response = await result.response;
      const text = response.text();
      
      return this.toJson(text);
      
    } catch (error) {
      console.error('Error generating career recommendations:', error);
      throw new Error('Failed to generate career recommendations');
    }
  }

  /**
   * Generate career options for database storage based on user answers
   * @param allAnswers All question-answer pairs from the complete form
   * @param userId User ID for linking career options
   * @returns Array of career options to be saved in database
   */
  async generateCareerOptionsForDB(allAnswers: QuestionAnswer[], userId: number): Promise<any[]> {
    try {
      const prompt = this.buildCareerOptionsPrompt(allAnswers);
      
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }]}],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      });
      const response = await result.response;
      const text = response.text();
      
      const careerOptions = this.toJson(text);
      
      // Add user_id and timestamps to each career option
      return careerOptions.map((option: any) => ({
        ...option,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('Error generating career options:', error);
      throw new Error('Failed to generate career options');
    }
  }

  /**
   * Build prompt for career recommendations
   */
  private buildRecommendationPrompt(allAnswers: QuestionAnswer[]): string {
    const qaContext = allAnswers.map((qa, index) => 
      `${index + 1}. Q: ${qa.question}\n   A: ${qa.answer}`
    ).join('\n\n');

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
  private buildCareerOptionsPrompt(allAnswers: QuestionAnswer[]): string {
    const qaContext = allAnswers.map((qa, index) => 
      `${index + 1}. Q: ${qa.question}\n   A: ${qa.answer}`
    ).join('\n\n');

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
  private toJson(text: string): any {
    try {
      return JSON.parse(text);
    } catch (_) {
      // Strip Markdown code fences if present
      const stripped = text
        .replace(/^```[a-zA-Z]*\n/m, '')
        .replace(/```\s*$/m, '')
        .trim();
      try {
        return JSON.parse(stripped);
      } catch (_) {
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

export default new GeminiService();
