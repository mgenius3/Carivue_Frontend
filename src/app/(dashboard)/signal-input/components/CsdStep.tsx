import React from 'react';
import { QuestionField } from './QuestionField';

interface StepProps {
  data: any;
  onChange: (data: any) => void;
}

export function CsdStep({ data, onChange }: StepProps) {
  const handleChange = (field: string, value: number | null) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="max-w-xl mx-auto">
        <QuestionField
          question="How many residents are currently under active clinical monitoring this week?"
          value={data.clinicalMonitoring}
          onChange={(val) => handleChange('clinicalMonitoring', val)}
          helperText="If Yes, Number of Residents"
        />
        
        <QuestionField
          question="Was there any new or worsening health deterioration requiring intervention this week?"
          value={data.healthDeterioration}
          onChange={(val) => handleChange('healthDeterioration', val)}
          helperText="If Yes, Number of Residents"
        />
        
        <QuestionField
          question="Were any residents admitted to hospital due to a new or worsening condition?"
          value={data.hospitalAdmissions}
          onChange={(val) => handleChange('hospitalAdmissions', val)}
          helperText="If Yes, Number of Admission"
        />
        
        <QuestionField
          question="Were there safeguarding concerns requiring formal external reporting?"
          value={data.safeguardingConcerns}
          onChange={(val) => handleChange('safeguardingConcerns', val)}
          helperText="If Yes, Number of Cases"
        />
        
        <QuestionField
          question="Did any resident require increased observations beyond their usual care plan?"
          value={data.increasedObservations}
          onChange={(val) => handleChange('increasedObservations', val)}
          helperText="If Yes, Number of Residents"
        />
      </div>
    </div>
  );
}
