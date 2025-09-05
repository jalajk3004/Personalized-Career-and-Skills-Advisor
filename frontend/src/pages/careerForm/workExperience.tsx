
import { FormWrapper } from "./FormWrap"

type WorkExperienceData = {
  no_experience: boolean
  job_title: string
  company_name: string
  duration: string
}

interface WorkExperienceProps extends WorkExperienceData {
  updateFields: (fields: Partial<WorkExperienceData>) => void
}

export function WorkExperience({no_experience, job_title, company_name, duration, updateFields}: WorkExperienceProps) {
  return (
    <FormWrapper title="Work Experience" >
        <div className="mb-6">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input 
              type="checkbox" 
              id="no_experience" 
              checked={no_experience} 
              onChange={e => updateFields({ no_experience: e.target.checked })}
              className="flex-shrink-0"
            />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
              I have no work experience
            </span>
          </label>
        </div>
        
        {!no_experience && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label>Job Title</label>
              <input 
                type="text" 
                id="job_title" 
                placeholder="e.g., Software Developer, Marketing Manager" 
                required={!no_experience}
                value={job_title} 
                onChange={e => updateFields({ job_title: e.target.value })}
              />
            </div>
            
            <div>
              <label>Company Name</label>
              <input 
                type="text" 
                id="company_name"
                placeholder="e.g., Google, Microsoft, Local Company" 
                required={!no_experience}
                value={company_name} 
                onChange={e => updateFields({company_name: e.target.value})}
              />
            </div>
            
            <div>
              <label>Duration</label>
              <input 
                type="text" 
                id="duration" 
                placeholder="e.g., 2 years 3 months, 1.5 years" 
                required={!no_experience}
                value={duration} 
                onChange={e => updateFields({duration: e.target.value})} 
              />
            </div>
          </div>
        )}
    </FormWrapper>
    )
}