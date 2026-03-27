import React from 'react';
import { QuestionField } from './QuestionField';

interface StepProps {
  data: any;
  onChange: (data: any) => void;
}

export function ModStep({ data, onChange }: StepProps) {
  const handleChange = (field: string, value: number | null) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="max-w-xl mx-auto">
        <QuestionField
          question="Did a manager or senior step in to complete tasks originally assigned to care staff?"
          value={data.managerIntervention}
          onChange={(val) => handleChange('managerIntervention', val)}
          helperText="If Yes, Number of Instances"
        />
        
        <QuestionField
          question="Were care records corrected or rewritten due to errors or omissions?"
          value={data.recordCorrection}
          onChange={(val) => handleChange('recordCorrection', val)}
          helperText="If Yes, Number of issues resolved"
        />
        
        <QuestionField
          question="Were safeguarding or complaint concerns managed internally without external referral?"
          value={data.internalSafeguarding}
          onChange={(val) => handleChange('internalSafeguarding', val)}
          helperText="If Yes, Number of cases"
        />
        
        <QuestionField
          question="Did supervisors need to repeat instructions or closely monitor staff due to performance concerns?"
          value={data.supervisoryOversight}
          onChange={(val) => handleChange('supervisoryOversight', val)}
          helperText="If Yes, Number of Instances"
        />
      </div>
    </div>
  );
}
