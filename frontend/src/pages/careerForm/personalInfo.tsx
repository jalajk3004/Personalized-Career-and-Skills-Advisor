import { FormWrapper } from "./FormWrap"
import { type FormData } from "./types";

type UserData = {
    name: string
    age: string
}

type PersonalInfoProps = UserData & {
    updateFields: (fields: Partial<FormData>) => void
}

export function PersonalInfo({name, age, updateFields}: PersonalInfoProps) {
    
    return (
                
                <FormWrapper title="Personal Information" >
                <div className="mb-4 grid">
                  <label >Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    placeholder="Enter Your name" 
                    required 
                    value={name} 
                    onChange={e => updateFields({ name: e.target.value })}
                  />
                </div>
                
                <div className="mb-4">
                  <label >Age</label>
                  <input 
                    type="number" 
                    id="age" 
                    placeholder="Enter your age" 
                    required 
                    value={age} 
                    onChange={e => updateFields({ age: e.target.value })}
                  />
                </div>
                </FormWrapper>
                
                
    );
}