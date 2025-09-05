
import { FormWrapper } from "./FormWrap"

type SkillData = {
  skills: string
  interests: string
  preferred_work_env: string
}

interface SkillFormProps extends SkillData {
  updateFields: (fields: Partial<SkillData>) => void
}

export function SkillForm({skills, interests, preferred_work_env, updateFields}: SkillFormProps) {
  return (
    <FormWrapper title="Skills and Interests" >
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label>Technical Skills</label>
          <textarea 
            id="skills" 
            placeholder="e.g., JavaScript, Python, Data Analysis, Digital Marketing, Graphic Design (separate with commas)" 
            required 
            value={skills} 
            onChange={e => updateFields({ skills: e.target.value })}
            rows={4}
            className="min-h-[100px]"
          />
          <p className="text-xs text-gray-500 mt-1">List your technical and professional skills separated by commas</p>
        </div>
        
        <div>
          <label>Interests & Hobbies</label>
          <textarea 
            id="interests" 
            placeholder="e.g., Reading, Photography, Sports, Music, Volunteering, Technology trends" 
            required 
            value={interests} 
            onChange={e => updateFields({ interests: e.target.value })}
            rows={4}
            className="min-h-[100px]"
          />
          <p className="text-xs text-gray-500 mt-1">Share your personal interests and activities you enjoy</p>
        </div>
        
        <div>
          <label>Preferred Work Environment</label>
          <select 
            id="preferred_work_env" 
            required 
            value={preferred_work_env} 
            onChange={e => updateFields({ preferred_work_env: e.target.value })}
          >
            <option value="">Select your preferred work environment</option>
            <option value="office">🏢 Office (Traditional workplace)</option>
            <option value="remote">🏠 Remote (Work from home)</option>
            <option value="hybrid">🔄 Hybrid (Mix of office and remote)</option>
            <option value="field">🌍 Field Work (On-site, travel required)</option>
            <option value="flexible">⚡ Flexible (Adaptable to any environment)</option>
          </select>
        </div>
      </div>
    </FormWrapper>
  );
        }