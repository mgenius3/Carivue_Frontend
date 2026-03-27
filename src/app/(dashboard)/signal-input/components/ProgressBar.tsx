import React from 'react';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
}

const steps = [
  "Operational Load (OAI)",
  "Managerial Stabilisation (MOD)",
  "Clinical Stabilisation (CSD)",
  "Confirm"
];

export function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-12">
      <div className="relative flex justify-between">
        {/* Connection Lines */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-green-500 -translate-y-1/2 z-0 transition-all duration-500" 
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {/* Step Circles */}
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-4 h-4 rounded-full border-2 transition-all duration-300 flex items-center justify-center
                  ${isCompleted || isActive ? 'border-green-500 bg-white' : 'border-gray-200 bg-white'}`}
              >
                {(isCompleted || isActive) && (
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                )}
              </div>
              <span 
                className={`absolute top-6 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider
                  ${isActive ? 'text-[#1F3A4A]' : 'text-gray-300'}`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
