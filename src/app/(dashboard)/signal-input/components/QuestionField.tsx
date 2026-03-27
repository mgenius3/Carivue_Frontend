import React from 'react';

interface QuestionFieldProps {
  question: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  helperText?: string;
}

export function QuestionField({ question, value, onChange, placeholder = "0000", helperText }: QuestionFieldProps) {
  const isYes = value !== null;

  return (
    <div className="mb-10 text-left max-w-lg mx-auto">
      <p className="text-[13px] font-medium text-gray-600 mb-3">{question}*</p>
      
      <div className="flex gap-4 mb-4">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div 
            onClick={() => onChange(value === null ? 0 : value)}
            className={`w-4 h-4 rounded-full border border-gray-200 flex items-center justify-center transition-all bg-white
              ${isYes ? 'border-primary ring-1 ring-primary/20' : 'group-hover:border-gray-300'}`}
          >
            {isYes && <div className="w-1.5 h-1.5 rounded-full bg-[#1F3A4A]" />}
          </div>
          <span className={`text-xs font-medium ${isYes ? 'text-[#1F3A4A]' : 'text-gray-400 uppercase tracking-wide'}`}>Yes</span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer group">
          <div 
            onClick={() => onChange(null)}
            className={`w-4 h-4 rounded-full border border-gray-200 flex items-center justify-center transition-all bg-white
              ${!isYes ? 'border-primary ring-1 ring-primary/20' : 'group-hover:border-gray-300'}`}
          >
            {!isYes && <div className="w-1.5 h-1.5 rounded-full bg-[#1F3A4A]" />}
          </div>
          <span className={`text-xs font-medium ${!isYes ? 'text-[#1F3A4A]' : 'text-gray-400 uppercase tracking-wide'}`}>No</span>
        </label>
      </div>

      {isYes && (
        <div className="mt-6 pl-0 animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-[11px] font-bold text-gray-500 mb-3">
            {helperText || "Number of Instances"}
          </p>
          <input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            placeholder={placeholder}
            className="w-full bg-white border border-gray-100 rounded-xl px-5 py-3.5 text-sm font-medium text-[#1F3A4A] outline-none shadow-sm focus:border-[#1F3A4A]/20 transition-all"
          />
        </div>
      )}
    </div>
  );
}
