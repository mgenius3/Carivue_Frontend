"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

function AccordionItem({ question, answer, isOpen, onClick }: AccordionItemProps) {
  return (
    <div className="border-b border-gray-100 last:border-none">
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center py-6 text-left hover:text-primary transition-colors focus:outline-none group"
      >
        <span className={cn(
            "text-sm font-bold transition-colors",
            isOpen ? "text-[#1F3A4A]" : "text-gray-500 group-hover:text-[#1F3A4A]"
        )}>
            {question}
        </span>
        <ChevronDown 
          size={18} 
          className={cn(
            "text-gray-300 transition-transform duration-300", 
            isOpen ? "rotate-180 text-[#1F3A4A]" : "group-hover:text-[#1F3A4A]"
          )} 
        />
      </button>
      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-96 pb-6" : "max-h-0"
        )}
      >
        <p className="text-sm text-gray-400 font-medium leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}

interface AccordionProps {
  items: { question: string; answer: string }[];
}

export function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col">
      {items.map((item, idx) => (
        <AccordionItem
          key={idx}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === idx}
          onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
        />
      ))}
    </div>
  );
}
