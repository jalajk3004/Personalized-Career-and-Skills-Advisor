import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

interface AIQuestion {
  id: string;
  question_text: string;
  question_type: string;
  category: string;
  options?: string[];
  is_required: boolean;
}

interface AIAnswer {
  question: string;
  answer: string;
  category: string;
}

const AIQuestionsPage = () => {
  const { userId, recommendationId } = useParams();
  const navigate = useNavigate();
  const {  loading: authLoading, token } = useAuth();
  
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    
    if (!token) {
      setError('Authentication required to load AI questions');
      setLoading(false);
      return;
    }
    
    loadAIQuestions();
  }, [authLoading, token, recommendationId]);

  const loadAIQuestions = async () => {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }
      
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`
      };
      
      const baseurl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
      
      const res = await fetch(`${baseurl}/api/career-recommendations/ai-questions/${recommendationId}`, {
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
      setError('Failed to load questions');
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

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      if (!token) {
        throw new Error('Authentication token is required');
      }

      const aiAnswers: AIAnswer[] = questions.map(question => ({
        question: question.question_text,
        answer: answers[question.id] || '',
        category: question.category
      }));
      const baseurl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
      const res = await fetch(`${baseurl}/api/career-recommendations/ai-answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recommendationId,
          ai_answers: aiAnswers
        })
      });

      if (!res.ok) throw new Error('Failed to submit AI answers');
      
      const result = await res.json();
      
      if (result.success) {
        navigate(`/career/${userId}/${recommendationId}/final-recommendations`);
      }
    } catch (err) {
      console.error('Error submitting AI answers:', err);
      setError('Failed to submit answers');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question: AIQuestion) => {
    switch (question.question_type) {
      case 'text':
      case 'number':
        return (
          <input
            type={question.question_type}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            required={question.is_required}
          />
        );

      case 'textarea':
        return (
          <textarea
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            required={question.is_required}
          />
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={answers[question.id] === 'true'}
              onChange={(e) => handleAnswerChange(question.id, e.target.checked.toString())}
              className="text-blue-600 focus:ring-blue-500 rounded"
            />
            <span className="text-gray-700">Yes</span>
          </label>
        );

      default:
        return null;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <div className="space-x-4">
            {error.includes('Authentication') ? (
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Login to Continue
              </button>
            ) : (
              <button
                onClick={() => navigate(`/career/${userId}/${recommendationId}`)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue to Results
              </button>
            )}
            <button
              onClick={loadAIQuestions}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const answeredQuestions = Object.keys(answers).filter(key => answers[key].trim() !== '').length;
  const progressPercentage = Math.round((answeredQuestions / questions.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-full mb-4">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
    
          </div>
          
         

          {/* Progress Bar */}
          <div className="max-w-md mx-auto mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Progress</span>
              <span className="text-sm font-medium text-blue-600">{answeredQuestions} of {questions.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {question.question_text}
                      {question.is_required && <span className="text-red-500 ml-1">*</span>}
                    </h3>
                    <div className="inline-block px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                      {question.category.replace('_', ' ')}
                    </div>
                  </div>
                  {renderQuestion(question)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-12 text-center">
          <button
            onClick={handleSubmit}
            disabled={submitting || answeredQuestions === 0}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {submitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Recommendations...
              </div>
            ) : (
              'Generate Final Recommendations'
            )}
          </button>
          
          
        </div>
      </div>
    </div>
  );
};

export default AIQuestionsPage;
