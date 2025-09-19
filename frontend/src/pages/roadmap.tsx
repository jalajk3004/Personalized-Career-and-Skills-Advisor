import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../AuthContext";

// Types
export interface RoadmapStep {
  id: string;
  name: string;
  description: string;
  link: string;
  icon?: string;
  completed?: boolean;
}

export interface RoadmapData {
  name: string;
  description?: string;
  steps: RoadmapStep[];
  estimated_timeline?: string;
  difficulty_level?: string;
}

export type TimelinePosition = "left" | "right";

export interface RenderedStep extends RoadmapStep {
  position: TimelinePosition;
  index: number;
}

// Tooltip State
interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  step?: RenderedStep;
}

const Roadmap: React.FC = () => {
  const { userId, recommendationId, title } = useParams();
  const { token } = useAuth();
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        setError(null);

        // Updated endpoint to match backend - using full backend URL
       
        if (!token) {
          throw new Error('Authentication token not available. Please log in again.');
        }
        
        const res = await fetch(
          `http://localhost:5000/api/career-recommendations/roadmaps/${userId}/${recommendationId}/${title}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!res.ok) {
          const errorText = await res.text();
          console.error('API Error Response:', errorText);
          throw new Error(`Failed to fetch roadmap: ${res.status} - ${errorText}`);
        }

        const response = await res.json();
        console.log('Roadmap API Response:', response);
        
        if (response.success && response.data) {
          setRoadmapData(response.data);
        } else {
          throw new Error(response.error || 'Invalid response format');
        }
      } catch (err: any) {
        console.error('Roadmap fetch error:', err);
        setError(err.message || "Something went wrong while fetching roadmap");
      } finally {
        setLoading(false);
      }
    };

    if (userId && recommendationId && title && token) {
      fetchRoadmap();
    }
  }, [userId, recommendationId, title, token]);
  
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
  });

  // Process steps with alternating positions (1st on right, 2nd on left, etc.)
  const processedSteps: RenderedStep[] = roadmapData?.steps.map((step, index) => ({
    ...step,
    position: index % 2 === 0 ? "right" : "left",
    index,
  })) || [];

  // Click handlers for showing tooltip
  const handleStepClick = (
    e: React.MouseEvent,
    step: RenderedStep
  ) => {
    e.stopPropagation(); // Prevent card click from triggering
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const tooltipWidth = 400;
    const tooltipHeight = 300;
    
    // Calculate fixed position relative to the element, not mouse
    let x = rect.right + 20; // Position to the right of the element
    let y = rect.top;
    
    // Adjust if tooltip would go off screen
    if (x + tooltipWidth > window.innerWidth - 20) {
      x = rect.left - tooltipWidth - 20; // Position to the left instead
    }
    
    // Adjust vertical position if needed
    if (y + tooltipHeight > window.innerHeight - 20) {
      y = window.innerHeight - tooltipHeight - 20;
    }
    
    setTooltip({
      visible: true,
      x: Math.max(20, x),
      y: Math.max(20, y),
      step,
    });
  };

  const handleTooltipClose = () => {
    setTooltip({ visible: false, x: 0, y: 0 });
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltip.visible) {
        const target = event.target as HTMLElement;
        if (!target.closest('.tooltip-container') && !target.closest('[data-step-button]')) {
          setTooltip({ visible: false, x: 0, y: 0 });
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [tooltip.visible]);

  // Show loading state
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!token ? 'Authenticating...' : 'Generating your personalized roadmap...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show no data state
  if (!roadmapData) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No roadmap data available</h2>
          <p className="text-gray-600">Please try again or contact support if the issue persists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 md:mb-4 px-4">
            {roadmapData.name}
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-4 md:mb-6 px-4">
            Interactive learning roadmap
          </p>
          
          {/* Timeline Info */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-sm px-4">
            <div className="flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="text-blue-600">📅</span>
              <span className="font-medium text-gray-700">
                {roadmapData.estimated_timeline || '18-24 months'}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <span className="text-green-600">📊</span>
              <span className="font-medium text-gray-700">
                {roadmapData.difficulty_level || 'Intermediate'}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Central Timeline Line - Hidden on mobile */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-blue-500 to-blue-600 h-full rounded-full"></div>
          
          {/* Timeline Steps */}
          <div className="space-y-8 md:space-y-16">
            {processedSteps.map((step, index) => (
              <div key={step.id} className="relative flex flex-col md:flex-row items-center">
                {/* Timeline Node */}
                <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 z-10 mb-4 md:mb-0">
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-base md:text-lg shadow-lg cursor-pointer hover:bg-blue-700 transition-all duration-300 hover:scale-110"
                    onClick={(e) => handleStepClick(e, step)}
                  >
                    {index + 1}
                  </div>
                </div>

                {/* Step Content Card */}
                <div className="w-full md:w-5/12 md:pr-8 md:pl-8 md:ml-auto">
                  <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 md:p-6 border border-gray-100 hover:border-blue-200 group">
                    
                    {/* Step Icon */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xl md:text-2xl">{step.icon}</span>
                      <div className="flex-1"></div>
                    </div>

                    {/* Step Title */}
                    <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {step.name}
                    </h3>

                    {/* Duration Badge */}
                    {(step as any).duration && (
                      <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium mb-3">
                        <span>⏱️</span>
                        <span>{(step as any).duration}</span>
                      </div>
                    )}

                    {/* Click for Details Button */}
                    <button
                      data-step-button
                      onClick={(e) => handleStepClick(e, step)}
                      className="w-full bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm font-medium mb-2"
                    >
                      Tap for details →
                    </button>

                    {/* Open Resource Button */}
                    <button
                      onClick={() => window.open(step.link, "_blank", "noopener,noreferrer")}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                    >
                      Open Resource →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Tooltip */}
        {tooltip.visible && tooltip.step && (
          <div
            className="tooltip-container fixed bg-white border border-gray-200 rounded-xl shadow-2xl p-4 md:p-6 text-sm transition-all duration-200 z-50 max-w-xs sm:max-w-sm md:max-w-md"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              opacity: tooltip.visible ? 1 : 0,
            }}
          >
            {/* Tooltip Header */}
            <div className="flex items-center justify-between gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-xl md:text-2xl">{tooltip.step.icon}</span>
                <div>
                  <h4 className="font-bold text-gray-800 text-base md:text-lg">{tooltip.step.name}</h4>
                  {(tooltip.step as any).duration && (
                    <div className="text-xs text-blue-600 font-medium">
                      ⏱️ {(tooltip.step as any).duration}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={handleTooltipClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-lg font-bold"
              >
                ×
              </button>
            </div>

            {/* Full Description */}
            <div className="text-gray-700 mb-3 md:mb-4 leading-relaxed text-xs md:text-sm">
              {tooltip.step.description}
            </div>

            {/* Key Outcomes */}
            {(tooltip.step as any).key_outcomes && (tooltip.step as any).key_outcomes.length > 0 && (
              <div className="mb-3 md:mb-4">
                <div className="text-xs font-semibold text-green-600 mb-2">Key Outcomes:</div>
                <ul className="text-xs text-gray-600 space-y-1">
                  {(tooltip.step as any).key_outcomes.map((outcome: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Button */}
            {tooltip.step.link && (
              <div className="border-t border-gray-100 pt-3 md:pt-4">
                <button
                  onClick={() => window.open(tooltip.step!.link, "_blank", "noopener,noreferrer")}
                  className="w-full bg-blue-600 text-white py-2 px-3 md:px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-xs md:text-sm font-medium"
                >
                  Open Resource →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Roadmap;
