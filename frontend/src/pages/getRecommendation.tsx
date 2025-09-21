import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Badge } from "../components/ui/badge";
import {
  AlertCircle,
  TrendingUp,
  Users,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { auth } from "../config/firebase";
import CareerModal from "@/components/careerModal";

// Types
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
  const { userId, recommendationId } = useParams<{
    userId?: string;
    recommendationId?: string;
  }>();
  const [careerOptions, setCareerOptions] = useState<CareerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRecommendations, setHasRecommendations] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState<CareerOption | null>(
    null
  );

  // Scroll
  const scrollContainer = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainer.current) {
      const scrollAmount = 400;
      const currentScroll = scrollContainer.current.scrollLeft;
      const targetScroll =
        direction === "left"
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      scrollContainer.current.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthLoading(false);
      if (user) {
        fetchRecommendations(user);
      } else {
        setError("Please sign in to view your career recommendations");
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
      const baseUrl =
        import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

      let url;
      if (userId && recommendationId) {
        url = `${baseUrl}/api/career-recommendations/recommendations/${userId}/${recommendationId}`;
      } else {
        url = `${baseUrl}/career-recommendations/recommendations`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data: CareerRecommendationsResponse = await response.json();
      setCareerOptions(data.data.career_options);
      setHasRecommendations(data.data.has_recommendations);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch career recommendations"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLearnMore = (career: CareerOption) => {
    setSelectedCareer(career);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCareer(null);
  };

  // ------------------- STATES ----------------------
  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="h-80 w-80">
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
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Recommendations
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!hasRecommendations || careerOptions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <BookOpen className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Career Recommendations Found
          </h1>
          <p className="text-gray-600 mb-6">
            Complete the career assessment form and AI questions to get
            personalized career recommendations tailored just for you.
          </p>
          <Button
            onClick={() => window.history.back()}
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Go Back to Assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Your Career Recommendations
            </h1>
            <p className="text-gray-600 text-lg lg:text-xl max-w-3xl mx-auto">
              Based on your responses, here are {careerOptions.length} career
              paths tailored specifically for you
            </p>
          </div>

          {/* Scrollable Cards */}
          <div className="relative">
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 rounded-full p-3 shadow-lg"
              style={{ marginLeft: "-20px" }}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 rounded-full p-3 shadow-lg"
              style={{ marginRight: "-20px" }}
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div
              ref={scrollContainer}
              className="flex gap-6 overflow-x-auto py-4 px-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {careerOptions.map((career) => (
                <CareerCard
                  key={career.career_id}
                  career={career}
                  onLearnMore={handleLearnMore}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-16">
            <p className="text-gray-600 mb-6">
              Want to retake the assessment?
            </p>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="bg-white/20 border-gray-300 text-gray-700 hover:bg-white hover:text-primary"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <CareerModal
        career={selectedCareer}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

// ------------------- Card ----------------------
interface CareerCardProps {
  career: CareerOption;
  onLearnMore: (career: CareerOption) => void;
}

const CareerCard: React.FC<CareerCardProps> = ({ career, onLearnMore }) => {
  return (
    <div className="flex-shrink-0 w-80 lg:w-96">
      <Card className="h-full bg-white border border-gray-200 shadow hover:shadow-lg transition-all duration-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-start gap-3">
            <Users className="h-5 w-5 text-blue-600" />
            <span>{career.name}</span>
          </CardTitle>
          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
            <TrendingUp className="h-3 w-3" />
            {career.formatted_growth_rate || `${career.growth_rate}% growth`}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription className="line-clamp-3 text-gray-600">
            {career.description}
          </CardDescription>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
            {
              `${career.currency} ${career.salary_range_min} - ${career.salary_range_max} LPA`}
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Required Skills:
            </h4>
            <div className="flex flex-wrap gap-1">
              {(career.skills_display ||
                career.required_skills?.slice(0, 4) ||
                []
              ).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {((career.additional_skills_count || 0) > 0 ||
                (!career.skills_display &&
                  (career.required_skills?.length || 0) > 4)) && (
                <Badge variant="outline" className="text-xs text-gray-500">
                  +
                  {career.additional_skills_count ||
                    (career.required_skills.length - 4)}{" "}
                  more
                </Badge>
              )}
            </div>
          </div>
          <Button
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-amber-50"
            onClick={() => onLearnMore(career)}
          >
            <BookOpen className="h-4 w-4 mr-2 text" />
            Learn More
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GetRecommendation;
