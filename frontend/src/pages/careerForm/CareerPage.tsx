import { useState, type FormEvent } from "react";
import { PersonalInfo } from "./personalInfo";
import { EducationForm } from "./educationForm";
import { WorkExperience } from "./workExperience";
import { SkillForm } from "./skillForm";
import { useMultistepForm } from "./useMultipleForm";

type FormData = {
  name: string
  age: string
  highschool_name: string
  highschool_stream: string
  college: string
  course_type: string
  course: string
  specialisation: string
  no_experience: boolean
  job_title: string
  company_name: string
  duration: string
  skills: string
  interests: string
  preferred_work_env: string
}

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
  
  function updateFields(fields: Partial<FormData>) {
    setData(prev => {
      return { ...prev, ...fields }
    })
  }

  const { steps, currentStepIndex, step, isFirstStep, isLastStep, back, next } =
      useMultistepForm([
        <PersonalInfo {...data} updateFields={updateFields} />,
        <EducationForm {...data} updateFields={updateFields} />,
        <WorkExperience {...data} updateFields={updateFields} />,
        <SkillForm {...data} updateFields={updateFields} />,
      ])

  function onSubmit(e: FormEvent) {
      e.preventDefault()
      if (!isLastStep) return next()
      handleSubmit()
  }

  const handleSubmit = async () => {
    try {
      console.log("Form Data:", data);
      // TODO: Implement API call here
      alert("Form submitted successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please try again.");
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Main Header */}
        <div className="text-center mb-8">
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Career Guidance Form
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Help us understand your background and aspirations to provide personalized career recommendations
          </p>
          
          {/* Progress Bar */}
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
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          {/* Form step content */}
          <div className="relative">
            <div className="transition-all duration-300 ease-in-out">
              {step}
            </div>
          </div>
          
          {/* Enhanced Navigation buttons */}
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
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 group"
              >
                {isLastStep ? (
                  <>
                    Submit
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










// try {
//     const auth = getAuth();
//     const user = auth.currentUser;
//     if (!user) throw new Error("User not logged in");

//     const idToken = await user.getIdToken(); 

//     const res = await fetch("http://localhost:5000/api/career-recommendations", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${idToken}`,
//       },
//       body: JSON.stringify(formData),
//     });

//     const data = await res.json();
//     if (!res.ok) throw new Error(data.error || "Failed to submit form");
//     window.location.href = `/career/${data.user_id}/${data.recommendation_id}`;
//     console.log("Form submitted successfully:", data);
    
    
//   } catch (err) {
//     console.error(err);
//   }
// };