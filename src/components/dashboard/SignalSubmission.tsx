"use client";

const submissionItems = [
  { name: "Willowbrooks Care Home", status: "Submitted", variant: "success" },
  { name: "Riversides Residential Care", status: "Submitted", variant: "success" },
  { name: "Oakwoods Supported Living", status: "Pending", variant: "warning" }
];

export function SignalSubmission() {
  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col">
      <h2 className="text-xl font-bold text-[#1F3A4A] mb-2">Weekly Signal Submission</h2>
      <p className="text-sm text-gray-400 font-medium mb-8">Current Reporting Status</p>
      
      <div className="space-y-4 flex-1">
        {submissionItems.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100/50 hover:bg-gray-100/80 transition-colors cursor-pointer">
            <span className="text-sm font-medium text-[#1F3A4A]">{item.name}</span>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wide ${
              item.variant === "success" 
                ? "bg-[#D1FAE5] text-[#059669]" 
                : "bg-[#FEF3C7] text-[#D97706]"
            }`}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
