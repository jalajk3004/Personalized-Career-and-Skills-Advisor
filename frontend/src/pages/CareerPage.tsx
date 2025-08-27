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

const CareerForm = () => {
  const [noExperience, setNoExperience] = useState(false);

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
              <Input placeholder="Enter your full name" />
            </div>
            <div>
              <Label>Age</Label>
              <Input type="number" placeholder="Enter your age" />
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
              <Input placeholder="Enter highschool name" />
            </div>
            <div>
              <Label>Highschool Stream</Label>
              <Select>
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
              <Input placeholder="Enter institution name" />
            </div>
            <div>
              <Label>Course Type</Label>
              <Select>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ug">UG</SelectItem>
                  <SelectItem value="pg">PG</SelectItem>
                  <SelectItem value="diploma">Diploma</SelectItem>
                  <SelectItem value="masters">Masters</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Course</Label>
              <Select>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bcom">B.Com</SelectItem>
                  <SelectItem value="bsc">B.Sc</SelectItem>
                  <SelectItem value="btech">B.Tech</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Specialisation</Label>
              <Select>
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cse">Computer Science</SelectItem>
                  <SelectItem value="ece">ECE</SelectItem>
                  <SelectItem value="mech">Mechanical</SelectItem>
                </SelectContent>
              </Select>
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
                checked={noExperience}
                onCheckedChange={(checked) => setNoExperience(!!checked)}
              />
              <Label htmlFor="noExp">No Work Experience</Label>
            </div>
            {!noExperience && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Job Title</Label>
                  <Input placeholder="Enter job title" />
                </div>
                <div>
                  <Label>Company Name</Label>
                  <Input placeholder="Enter company name" />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Input placeholder="e.g. 2 years" />
                </div>
                <div>
                  <Label>Key Skills</Label>
                  <Input placeholder="e.g. React, SQL, Marketing" />
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
              <Input placeholder="e.g. AI, Finance, Design" />
            </div>
            <div>
              <Label>Preferred Work Environment</Label>
              <Select>
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
              <Input placeholder="e.g. Java, Communication, Leadership" />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-6">
            <Button className="px-6 py-2 text-lg">Submit</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CareerForm;
