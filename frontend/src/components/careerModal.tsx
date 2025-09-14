import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BookOpen } from "lucide-react";

interface CareerOption {
  career_id: number;
  name: string;
  description: string;
  salary_range_min: number;
  salary_range_max: number;
  currency: string;
  required_skills: string[];
  growth_rate: number;
  formatted_salary?: string;
  formatted_growth_rate?: string;
  skills_display?: string[];
}

interface CareerModalProps {
  career: CareerOption | null;
  isOpen: boolean;
  onClose: () => void;
}

const CareerModal: React.FC<CareerModalProps> = ({ career, isOpen, onClose }) => {
  if (!career) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
          w-[95vw]       /* take almost full screen width */
          max-w-5xl      /* wider modal on larger screens */
          h-auto         /* let content decide height */
          max-h-[90vh]   /* keep within viewport */
          bg-white       /* solid background */
          rounded-2xl
          shadow-lg
          overflow-hidden /* prevent scrollbars */
        "
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {career.name}
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3" />
              {career.formatted_growth_rate || `${career.growth_rate}% growth`}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            A detailed overview of this career path
          </DialogDescription>
        </DialogHeader>

        {/* Salary */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-green-800 mb-4">
         
          <span>
             {
              `${career.currency} ${career.salary_range_min} - ${career.salary_range_max} LPA`}
          </span>
        </div>

        {/* Description */}
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-lg">About this career</h3>
          <p className="text-gray-700 leading-relaxed">{career.description}</p>
        </div>

        {/* Skills */}
        <div>
            <h4 className="text-lg font-medium flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5" />
              Required Skills:
            </h4>
            <div className="flex flex-wrap gap-2">
              {career.required_skills?.map((skill: string, index: number) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
        </div>

      
      </DialogContent>
    </Dialog>
  );
};

export default CareerModal;
