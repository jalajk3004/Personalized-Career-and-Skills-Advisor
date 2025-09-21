import { useState, type FormEvent } from "react";
import { PersonalInfo } from "./personalInfo";
import { EducationForm } from "./educationForm";
import { WorkExperience } from "./workExperience";
import { SkillForm } from "./skillForm";
import { AIQuestionsForm } from "./AIQuestionsForm";
import { useMultistepForm } from "./useMultipleForm";
import { useAuth } from "../../AuthContext";
import { type FormData } from "./types";

const INITIAL_DATA: FormData = {
  name: "",
  age: "",
  highschool_name: "",
  highschool_stream: "",
  college: "",
  course_type: "",
  course: "",
  specialisation: "",
  no_experience: false,
  job_title: "",
  company_name: "",
  duration: "",
  skills: "",
  interests: "",
  preferred_work_env: ""
};

function CareerForm() {
  const [data, setData] = useState(INITIAL_DATA);
  const [recommendationId, setRecommendationId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [aiAnswers, setAiAnswers] = useState<Record<string, string>>({});
  const [aiQuestions, setAiQuestions] = useState<any[]>([]);
  const [isSubmittingInitialForm, setIsSubmittingInitialForm] = useState(false);
  const [isSubmittingFinalForm, setIsSubmittingFinalForm] = useState(false);
  const { token } = useAuth();
  
  const handleAIAnswersReady = (answers: Record<string, string>, questions: any[]) => {
    setAiAnswers(answers);
    setAiQuestions(questions);
  };
  
  function updateFields(fields: Partial<FormData>) {
    setData(prev => {
      return { ...prev, ...fields }
    })
  }

  const steps = [
    <PersonalInfo {...data} updateFields={updateFields} />,
    <EducationForm {...data} updateFields={updateFields} />,
    <WorkExperience {...data} updateFields={updateFields} />,
    <SkillForm {...data} updateFields={updateFields} />,
    ...(recommendationId ? [
      <AIQuestionsForm 
        recommendationId={recommendationId} 
        onAIAnswersReady={handleAIAnswersReady}
      />
    ] : []),
  ];

  const { currentStepIndex, step, isFirstStep, isLastStep, back, next } =
      useMultistepForm(steps)

  function onSubmit(e: FormEvent) {
      e.preventDefault()
      
      if (currentStepIndex === 3 && !recommendationId) {
        handleInitialSubmit()
        return
      }
      
      if (!isLastStep) return next()
      
      handleFinalSubmit()
  }

  const handleInitialSubmit = async () => {
    try {
      setIsSubmittingInitialForm(true);
      
      if (!token) {
        throw new Error("Authentication required");
      }
      const baseurl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

      const res = await fetch(`${baseurl}/api/career-recommendations/ai-submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to submit form");
      
      setRecommendationId(result.recommendation_id);
      setUserId(result.user_id);
      
      next();
      
    } catch (err) {
      console.error("Error submitting initial form:", err);
      alert("Error submitting form. Please try again.");
    } finally {
      setIsSubmittingInitialForm(false);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      setIsSubmittingFinalForm(true);

      if (!token || !recommendationId) {
        throw new Error("Authentication or recommendation ID missing");
      }

      const aiAnswersFormatted = Object.entries(aiAnswers)
        .filter(([_, answer]) => answer.trim() !== '')
        .map(([questionId, answer]) => {
          const question = aiQuestions.find(q => q.id === questionId);
          return {
            question: question ? question.question_text : questionId,
            answer: answer,
            category: question ? question.category : 'ai_generated'
          };
        });
      const baseurl = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

      const res = await fetch(`${baseurl}/api/career-recommendations/ai-answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recommendationId,
          ai_answers: aiAnswersFormatted
        })
      });

      const result = await res.json();
      if (!res.ok) throw new Error('Failed to submit AI answers');
      
      if (result.success) {
        const finalUserId = result.data.user_id || userId;
        window.location.href = `/career/${finalUserId}/${recommendationId}`;
      }
      
    } catch (err) {
      console.error("Error submitting final answers:", err);
      alert("Error submitting answers. Please try again.");
    } finally {
      setIsSubmittingFinalForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
   
      {isSubmittingFinalForm && (
  <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
    <div className="flex flex-col items-center space-y-6">
      {/* Pulse background circle */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-blue-200 opacity-50 animate-ping"></div>
        <svg
          className="animate-spin h-14 w-14 text-blue-600 relative z-10"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 
              0 5.373 0 12h4zm2 5.291A7.962 
              7.962 0 714 12H0c0 3.042 1.135 
              5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>

      {/* Loader Text */}
      <p className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
        Fetching your Career Paths...
      </p>
    </div>
  </div>
)}


      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Career Guidance Form
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Help us understand your background and aspirations to provide personalized career recommendations
          </p>
          
          <div className="max-w-md mx-auto mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Progress</span>
              <span className="text-sm font-medium text-blue-600">{currentStepIndex + 1} of {steps.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
            <div className="text-center mt-2">
              <span className="text-xs text-gray-500">
                {currentStepIndex === 0 && "Personal Information"}
                {currentStepIndex === 1 && "Education Details"}
                {currentStepIndex === 2 && "Work Experience"}
                {currentStepIndex === 3 && "Skills & Interests"}
                {currentStepIndex === 4 && "Some more Questions"}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          <div className="relative">
            <div className="transition-all duration-300 ease-in-out">
              {step}
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="flex items-center space-x-4 bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
              {!isFirstStep ? (
                <button 
                  type="button" 
                  onClick={back}
                  className="flex items-center px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium shadow-sm hover:shadow-md group"
                >
                  <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              ) : (
                <div className="w-[100px]"></div>
              )}
              
              <div className="flex space-x-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentStepIndex
                        ? 'bg-blue-600 scale-125'
                        : index < currentStepIndex
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <button 
                type="submit"
                disabled={isSubmittingInitialForm || isSubmittingFinalForm}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmittingInitialForm ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : isLastStep ? (
                  <>
                    Get Recommendations
                    <svg className="w-4 h-4 ml-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    Next
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CareerForm;
