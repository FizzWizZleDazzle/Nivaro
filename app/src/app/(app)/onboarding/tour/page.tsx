'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TourStep {
  id: number;
  title: string;
  description: string;
  features: string[];
  color: string;
  icon: string;
}

const tourSteps: TourStep[] = [
  {
    id: 1,
    title: "Meetings & Events",
    description: "Organize and manage club meetings with ease. Schedule events, track RSVPs, and keep everyone informed.",
    features: [
      "Easy event scheduling",
      "RSVP tracking and management", 
      "Automatic notifications",
      "Meeting notes and recordings"
    ],
    color: "bg-green-500",
    icon: "📅"
  },
  {
    id: 2,
    title: "Project Collaboration",
    description: "Work together on coding projects, share repositories, and collaborate on technical challenges.",
    features: [
      "Project workspace creation",
      "Code sharing and review",
      "Task assignment and tracking",
      "Integration with Git platforms"
    ],
    color: "bg-purple-500",
    icon: "🚀"
  },
  {
    id: 3,
    title: "Learning Center",
    description: "Access educational resources, tutorials, and skill-building content tailored to your interests.",
    features: [
      "Curated learning paths",
      "Progress tracking",
      "Skill assessments",
      "Resource recommendations"
    ],
    color: "bg-indigo-500",
    icon: "📚"
  },
  {
    id: 4,
    title: "Community & Forums",
    description: "Connect with other members, ask questions, get mentorship, and share knowledge.",
    features: [
      "Discussion forums",
      "Mentorship matching",
      "Q&A platform",
      "Knowledge sharing"
    ],
    color: "bg-orange-500",
    icon: "💬"
  }
];

export default function OnboardingTour() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsCompleting(true);
    setTimeout(() => {
      router.push('/');
    }, 1000);
  };

  const currentTourStep = tourSteps[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Tour</h1>
          <p className="text-gray-600">
            Let&apos;s explore what you can do with Nivaro
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              ✓
            </div>
            <div className="w-16 h-1 bg-green-500"></div>
            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              ✓
            </div>
            <div className="w-16 h-1 bg-green-500"></div>
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              3
            </div>
          </div>
        </div>

        {/* Tour step indicator */}
        <div className="flex justify-center space-x-2">
          {tourSteps.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentStep ? 'bg-blue-600' : 
                index < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className={`${currentTourStep.color} p-6 text-white text-center`}>
            <div className="text-4xl mb-4">{currentTourStep.icon}</div>
            <h2 className="text-2xl font-bold mb-2">{currentTourStep.title}</h2>
            <p className="text-lg opacity-90">{currentTourStep.description}</p>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Features:</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {currentTourStep.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {currentStep === 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>Pro tip:</strong> You can access meetings from any club you join. Each club has its own calendar and event schedule.
                </p>
              </div>
            )}

            {currentStep === 1 && (
              <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                <p className="text-purple-800 text-sm">
                  <strong>Pro tip:</strong> Share your GitHub repositories with club members and get code reviews from peers and mentors.
                </p>
              </div>
            )}

            {currentStep === 2 && (
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                <p className="text-indigo-800 text-sm">
                  <strong>Pro tip:</strong> Learning paths are customized based on your experience level and interests that you shared earlier.
                </p>
              </div>
            )}

            {currentStep === 3 && (
              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <p className="text-orange-800 text-sm">
                  <strong>Pro tip:</strong> Don&apos;t hesitate to ask questions! The community is here to help you learn and grow.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="bg-gray-200 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <span className="text-gray-500 text-sm">
            {currentStep + 1} of {tourSteps.length}
          </span>

          <button
            onClick={handleNext}
            disabled={isCompleting}
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCompleting ? 'Finishing...' : currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip tour and go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}