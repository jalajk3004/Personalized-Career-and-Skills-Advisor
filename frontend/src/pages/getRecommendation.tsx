import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { AlertCircle, TrendingUp, DollarSign, Users, BookOpen } from 'lucide-react';
import { auth } from '../config/firebase';

// Types for career data
interface CareerOption {
  career_id: number;
  name: string;
  description: string;
  salary_range_min: number;
  salary_range_max: number;
  currency: string;
  required_skills: string[];
  growth_rate: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  formatted_salary?: string;
  formatted_growth_rate?: string;
  skills_display?: string[];
  additional_skills_count?: number;
}

interface CareerRecommendationsResponse {
  success: boolean;
  message: string;
  data: {
    career_options: CareerOption[];
    has_recommendations: boolean;
    count: number;
  };
}

const GetRecommendation: React.FC = () => {
  const { userId, recommendationId } = useParams<{ userId?: string; recommendationId?: string }>();
  const [careerOptions, setCareerOptions] = useState<CareerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRecommendations, setHasRecommendations] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthLoading(false);
      if (user) {
        fetchRecommendations(user);
      } else {
        setError('Please sign in to view your career recommendations');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [userId, recommendationId]);

  const fetchRecommendations = async (user: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await user.getIdToken();
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      // Determine which endpoint to call
      let url;
      if (userId && recommendationId) {
        url = `${baseUrl}/career-recommendations/recommendations/${userId}/${recommendationId}`;
      } else {
        url = `${baseUrl}/career-recommendations/recommendations`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data: CareerRecommendationsResponse = await response.json();
      setCareerOptions(data.data.career_options);
      setHasRecommendations(data.data.has_recommendations);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch career recommendations');
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="h-80">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="h-12 sm:h-16 w-12 sm:w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Error Loading Recommendations</h1>
            <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="px-6 py-2"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasRecommendations || careerOptions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <BookOpen className="h-12 sm:h-16 w-12 sm:w-16 text-blue-500 mx-auto mb-4" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">No Career Recommendations Found</h1>
            <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
              Complete the career assessment form and AI questions to get personalized career recommendations tailored just for you.
            </p>
            <Button 
              onClick={() => window.history.back()} 
              variant="default"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
            >
              Go Back to Assessment
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Your Career Recommendations
            </h1>
            <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto">
              Based on your responses, here are {careerOptions.length} career paths tailored specifically for you
            </p>
          </div>

        {/* Career Options Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {careerOptions.map((career) => (
            <CareerCard key={career.career_id} career={career} />
          ))}
        </div>

        {/* Footer Actions */}
        <div className="text-center mt-12 sm:mt-16">
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Want to retake the assessment?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Button 
              onClick={() => window.history.back()} 
              variant="outline"
              className="w-full sm:w-auto px-6 py-2"
            >
              Go Back
            </Button>
            
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

// Career Card Component
interface CareerCardProps {
  career: CareerOption;
}

const CareerCard: React.FC<CareerCardProps> = ({ career }) => {
  return (
    <Card className="h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 hover:border-l-blue-600 bg-white hover:bg-gray-50">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <CardTitle className="text-lg sm:text-xl text-gray-900 flex items-start gap-2 leading-tight">
          <Users className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <span className="break-words">{career.name}</span>
        </CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
            <TrendingUp className="h-3 w-3" />
            {career.formatted_growth_rate || `${career.growth_rate}% growth`}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Description */}
        <CardDescription className="text-sm leading-relaxed text-gray-600 line-clamp-3">
          {career.description}
        </CardDescription>

        {/* Salary Range */}
        <div className="flex items-center gap-2 p-2 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
          <span className="text-sm font-medium text-green-800 break-words">
            {career.formatted_salary || `${career.salary_range_min} - ${career.salary_range_max} ${career.currency}`}
          </span>
        </div>

        {/* Required Skills */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <BookOpen className="h-4 w-4 flex-shrink-0" />
            Required Skills:
          </h4>
          <div className="flex flex-wrap gap-1">
            {(career.skills_display || career.required_skills?.slice(0, 3) || []).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                {skill}
              </Badge>
            ))}
            {((career.additional_skills_count || 0) > 0 || (!career.skills_display && (career.required_skills?.length || 0) > 3)) && (
              <Badge variant="outline" className="text-xs text-gray-500 px-2 py-1">
                +{career.additional_skills_count || ((career.required_skills?.length || 0) - 3)} more
              </Badge>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full mt-4 sm:mt-6 bg-blue-600 hover:bg-blue-700 transition-colors" variant="default">
          <BookOpen className="h-4 w-4 mr-2" />
          Learn More
        </Button>
      </CardContent>
    </Card>
  );
};

export default GetRecommendation;
