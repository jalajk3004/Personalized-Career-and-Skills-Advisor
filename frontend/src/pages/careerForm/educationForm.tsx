import { FormWrapper } from "./FormWrap"
import { type FormData } from "./types";

type EducationData = {
  highschool_name: string
  highschool_stream: string
  college: string
  course_type: string
  course: string
  specialisation: string
}

type EducationProps =  EducationData 
 & {
    updateFields: (fields: Partial<FormData>) => void
}

export function EducationForm({highschool_name, highschool_stream, college, course_type, course, specialisation, updateFields}: EducationProps) {
  return (
    <FormWrapper title="Education Details" >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label>High School Name</label>
          <input 
            type="text" 
            id="highschool_name" 
            placeholder="e.g., ABC High School, XYZ Public School" 
            required 
            value={highschool_name} 
            onChange={e => updateFields({ highschool_name: e.target.value })}
          />
        </div>
        
        <div>
          <label>High School Stream</label>
          <select 
            id="highschool_stream" 
            required
            value={highschool_stream} 
            onChange={e => updateFields({ highschool_stream: e.target.value })} 
          >
            <option value="">Select your stream</option>
            <option value="science">Science (PCM/PCB)</option>
            <option value="commerce">Commerce</option>
            <option value="arts">Arts/Humanities</option>
            <option value="vocational">Vocational</option>
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label>College/University</label>
          <input 
            type="text" 
            id="college" 
            placeholder="e.g., University of Delhi, IIT Bombay, Local College" 
            required 
            value={college} 
            onChange={e => updateFields({ college: e.target.value })}
          />
        </div>
        
        <div>
          <label>Course Type</label>
          <select 
            id="degree" 
            required 
            value={course_type} 
            onChange={e => updateFields({ course_type: e.target.value })}
          >
            <option value="">Select course type</option>
            <option value="UnderGraduate">Undergraduate (Bachelor's)</option>
            <option value="Graduate">Graduate (Master's)</option>
            <option value="Diploma">Diploma</option>
            <option value="phd">Ph.D (Doctorate)</option>
            <option value="certificate">Certificate Course</option>
          </select>
        </div>
        
        <div>
          <label>Course/Degree</label>
          <input 
            type="text" 
            id="course" 
            placeholder="e.g., B.Tech, MBA, B.Com, M.Sc" 
            required 
            value={course} 
            onChange={e => updateFields({ course: e.target.value })}
          />
        </div>
        
        <div className="md:col-span-2">
          <label>Specialization/Major</label>
          <input 
            type="text" 
            id="specialisation" 
            placeholder="e.g., Computer Science, Finance, Marketing, Biology" 
            required 
            value={specialisation} 
            onChange={e => updateFields({ specialisation: e.target.value })}
          />
        </div>
      </div>
    </FormWrapper>
  );
}