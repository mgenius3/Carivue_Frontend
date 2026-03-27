"use client";

import { TrendingUp, Zap, Lightbulb } from "lucide-react";

const reviewItems = [
  {
    icon: TrendingUp,
    color: "text-[#C7791A]",
    bgColor: "bg-[#FFF8F1]",
    text: "Workforce compensation effort is increasing in Willowbrooks Care Home"
  },
  {
    icon: Zap,
    color: "text-[#C7791A]",
    bgColor: "bg-[#FFF8F1]",
    text: "Night-shift scheduling requires increased managerial intervention."
  },
  {
    icon: Lightbulb,
    color: "text-[#C7791A]",
    bgColor: "bg-[#FFF8F1]",
    text: "Clinical oversight activity is above the expected operating range."
  }
];

export function OperationalReview() {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col">
      <h2 className="text-xl font-bold text-[#1F3A4A] mb-2">Areas for Operational Review</h2>
      <p className="text-sm text-gray-400 font-medium mb-8">Based on recent strain patterns, you may wish to review the following areas.</p>
      
      <div className="space-y-4 flex-1">
        {reviewItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex gap-4 p-4 rounded-xl items-start bg-gray-50 border border-gray-100/50 hover:bg-gray-100/80 transition-colors cursor-pointer group">
              <div className={item.bgColor + " p-2.5 rounded-lg shrink-0 group-hover:scale-110 transition-transform"}>
                <Icon size={18} className={item.color} />
              </div>
              <p className="text-sm font-medium text-[#1F3A4A] leading-relaxed pt-1">{item.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
