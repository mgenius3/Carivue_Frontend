"use client";

import { TrendingUp, Zap, Lightbulb } from "lucide-react";

const iconMap = [TrendingUp, Zap, Lightbulb] as const;

interface ReviewItem {
  text: string;
}

interface OperationalReviewProps {
  items: ReviewItem[];
}

export function OperationalReview({ items }: OperationalReviewProps) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col">
      <h2 className="text-xl font-bold text-[#1F3A4A] mb-2">Areas for Operational Review</h2>
      <p className="text-sm text-gray-400 font-medium mb-8">Based on recent strain patterns, you may wish to review the following areas.</p>
      
      <div className="space-y-4 flex-1">
        {items.length === 0 && (
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100/50 text-sm text-gray-500">
            No priority review items yet. We’ll surface them here as new strain patterns appear.
          </div>
        )}

        {items.map((item, idx) => {
          const Icon = iconMap[idx % iconMap.length];
          return (
            <div key={idx} className="flex gap-4 p-4 rounded-xl items-start bg-gray-50 border border-gray-100/50 hover:bg-gray-100/80 transition-colors cursor-pointer group">
              <div className="bg-[#FFF8F1] p-2.5 rounded-lg shrink-0 group-hover:scale-110 transition-transform">
                <Icon size={18} className="text-[#C7791A]" />
              </div>
              <p className="text-sm font-medium text-[#1F3A4A] leading-relaxed pt-1">{item.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
