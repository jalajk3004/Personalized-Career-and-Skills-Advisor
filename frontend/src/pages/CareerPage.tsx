import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getAuth } from "firebase/auth";

const CareerForm = () => {
  const [noExperience, setNoExperience] = useState(false);
  const [formData, setFormData] = useState({
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
});

const handleSubmit = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");

    const idToken = await user.getIdToken(); 

    const res = await fetch("http://localhost:5000/api/career-recommendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to submit form");

    alert(`Form submitted! Recommendation ID: ${data.recommendation_id}`);
    // Optionally redirect to recommendation page:
    // router.push(`/career-recommendations/${data.recommendation_id}`);
  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-3xl shadow-lg rounded-2xl p-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Name</Label>
              <Input 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name" />
            </div>
            <div>
              <Label>Age</Label>
              <Input type="number" 
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="Enter your age" />
            </div>
          </div>

          {/* Education */}
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700">
              Educational Background
            </CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Highschool Name</Label>
              <Input placeholder="Enter highschool name"
              value={formData.highschool_name}
              onChange={(e) => setFormData({ ...formData, highschool_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Highschool Stream</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, highschool_stream: value })}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select stream" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="commerce">Commerce</SelectItem>
                  <SelectItem value="arts">Arts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>College/University</Label>
              <Input placeholder="Enter institution name" 
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              />
            </div>
            <div>
              <Label>Course Type</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, course_type: value })}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ug">UG</SelectItem>
                  <SelectItem value="pg">PG</SelectItem>
                  <SelectItem value="diploma">Diploma</SelectItem>
                  <SelectItem value="masters">Masters</SelectItem>
                  <SelectItem value="masters">Ph.d.</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Course</Label>
              <Input placeholder="Enter Course name"
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              />
            </div>
            <div>
              <Label>Specialisation</Label>
              <Input placeholder="Enter Specialisation" 
              value={formData.specialisation}
              onChange={(e) => setFormData({ ...formData, specialisation: e.target.value })}
              />
            </div>
          </div>

          {/* Work Experience */}
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700">
              Work Experience
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="noExp"
                checked={formData.no_experience}
                onCheckedChange={(checked) => setFormData({ ...formData, no_experience: !!checked })}
              />
              <Label htmlFor="noExp">No Work Experience</Label>
            </div>
            {!noExperience && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Job Title</Label>
                  <Input placeholder="Enter job title"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })} 
                  />
                </div>
                <div>
                  <Label>Company Name</Label>
                  <Input placeholder="Enter company name" 
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input placeholder="e.g. 2 years" 
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Goals */}
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700">
              Goals
            </CardTitle>
          </CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Interests</Label>
              <Input placeholder="e.g. AI, Finance, Design"
              value={formData.interests}
              onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
              />
            </div>
            <div>
              <Label>Preferred Work Environment</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, preferred_work_env: value })}>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Skills You Possess</Label>
              <Input placeholder="e.g. Java, Communication, Leadership"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-6">
            <Button className="px-6 py-2 text-lg" onClick={handleSubmit}>Submit</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CareerForm;
