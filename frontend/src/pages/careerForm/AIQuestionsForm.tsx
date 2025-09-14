import { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { FormWrapper } from './FormWrap';

interface AIQuestion {
  id: string;
  question_text: string;
  question_type: string;
  category: string;
  options?: string[];
  is_required: boolean;
}

interface AIQuestionsFormProps {
  recommendationId: string | null;
  onAIAnswersReady: (answers: Record<string, string>, questions: AIQuestion[]) => void;
}

export function AIQuestionsForm({ recommendationId, onAIAnswersReady }: AIQuestionsFormProps) {
  const { token } = useAuth();
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (recommendationId && token) {
      loadAIQuestions();
    }
  }, [recommendationId, token]);

  useEffect(() => {
    // Notify parent component when answers change
    onAIAnswersReady(answers, questions);
  }, [answers, questions, onAIAnswersReady]);

  const loadAIQuestions = async () => {
    if (!recommendationId || !token) return;
    
    try {
      setLoading(true);
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`
      };
      
      const res = await fetch(`http://localhost:5000/api/career-recommendations/ai-questions/${recommendationId}`, {
        headers
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('API Error:', res.status, errorText);
        throw new Error(`Failed to load AI questions: ${res.status}`);
      }
      
      const result = await res.json();
      
      if (result.success && result.data.ai_questions) {
        setQuestions(result.data.ai_questions);
      } else {
        setError('No AI questions found');
      }
    } catch (err) {
      console.error('Error loading AI questions:', err);
      setError('Failed to load personalized questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const renderQuestion = (question: AIQuestion) => {
    switch (question.question_type) {
      case 'text':
      case 'number':
        return (
          <input
            type={question.question_type}
            placeholder={`Enter your ${question.question_type === 'number' ? 'answer' : 'response'}...`}
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            required={question.is_required}
          />
        );

      case 'textarea':
        return (
          <textarea
            rows={4}
            placeholder="Please share your thoughts..."
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            required={question.is_required}
          />
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:border-gray-300">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-gray-700 font-medium">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:border-gray-300">
            <input
              type="checkbox"
              checked={answers[question.id] === 'true'}
              onChange={(e) => handleAnswerChange(question.id, e.target.checked.toString())}
              className="w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2 rounded"
            />
            <span className="text-gray-700 font-medium">Yes</span>
          </label>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <FormWrapper title="Some more Questions">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating personalized questions...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
        </div>
      </FormWrapper>
    );
  }

  if (error) {
    return (
      <FormWrapper title="Some more Questions">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={loadAIQuestions}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </FormWrapper>
    );
  }

  if (questions.length === 0) {
    return (
      <FormWrapper title="Some more Questions">
        <div className="text-center py-12">
          <div className="text-gray-600 mb-4">No personalized questions available</div>
          <p className="text-sm text-gray-500">You can proceed to get your recommendations</p>
        </div>
      </FormWrapper>
    );
  }

  const answeredQuestions = Object.keys(answers).filter(key => answers[key].trim() !== '').length;

  return (
    <FormWrapper title="Some more Questions">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Progress</span>
          <span className="text-sm font-medium text-blue-600">{answeredQuestions} of {questions.length} answered</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.round((answeredQuestions / questions.length) * 100)}%` }}
          ></div>
        </div>
      </div>

      {/* AI Questions */}
      <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
        {questions.map((question, index) => (
          <div key={question.id} className="mb-6">
            <div className="flex items-start space-x-3 mb-3">
              <div className="flex-shrink-0">
                <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1">
                <label className="font-semibold text-gray-900 mb-2 block">
                  {question.question_text}
                  {question.is_required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="inline-block px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 mb-3">
                  {question.category.replace('_', ' ')}
                </div>
              </div>
            </div>
            <div className="ml-10">
              {renderQuestion(question)}
            </div>
          </div>
        ))}
      </div>
      
     
    </FormWrapper>
  );
}