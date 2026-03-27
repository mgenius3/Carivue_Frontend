"use client";

interface SubmissionItem {
  name: string;
  status: string;
  variant: "success" | "warning" | "neutral";
  detail?: string;
}

interface SignalSubmissionProps {
  items: SubmissionItem[];
  title?: string;
  subtitle?: string;
}

export function SignalSubmission({
  items,
  title = "Recent Signal Submissions",
  subtitle = "Latest reporting activity across your organisation",
}: SignalSubmissionProps) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col">
      <h2 className="text-xl font-bold text-[#1F3A4A] mb-2">{title}</h2>
      <p className="text-sm text-gray-400 font-medium mb-8">{subtitle}</p>
      
      <div className="space-y-4 flex-1">
        {items.length === 0 && (
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100/50 text-sm text-gray-500">
            No live submission activity yet.
          </div>
        )}

        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100/50 hover:bg-gray-100/80 transition-colors cursor-pointer">
            <div>
              <span className="text-sm font-medium text-[#1F3A4A]">{item.name}</span>
              {item.detail && <p className="text-xs text-gray-400 mt-1">{item.detail}</p>}
            </div>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wide ${
              item.variant === "success" 
                ? "bg-[#D1FAE5] text-[#059669]" 
                : item.variant === "warning"
                  ? "bg-[#FEF3C7] text-[#D97706]"
                  : "bg-gray-100 text-gray-500"
            }`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
