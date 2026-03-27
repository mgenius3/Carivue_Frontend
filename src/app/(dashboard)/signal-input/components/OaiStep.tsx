import React from 'react';
import { QuestionField } from './QuestionField';

interface StepProps {
  data: any;
  onChange: (data: any) => void;
}

export function OaiStep({ data, onChange }: StepProps) {
  const handleChange = (field: string, value: number | null) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="max-w-xl mx-auto">
        <QuestionField
          question="Was there any last-minute sickness or absence affecting scheduled shifts?"
          value={data.sicknessAbsences}
          onChange={(val) => handleChange('sicknessAbsences', val)}
          helperText="If Yes, Number of Shifts/Visits"
        />
        
        <QuestionField
          question="Did you rearrange shifts due to short-notice absence?"
          value={data.shiftReallocations}
          onChange={(val) => handleChange('shiftReallocations', val)}
          helperText="If Yes, Number of Reallocations"
        />
        
        <QuestionField
          question="Did staff work additional shifts beyond their planned rota?"
          value={data.additionalShifts}
          onChange={(val) => handleChange('additionalShifts', val)}
          helperText="If Yes, Additional shifts worked"
        />
        
        <QuestionField
          question="Was there any unauthorized absence this week?"
          value={data.unauthorizedAbsences}
          onChange={(val) => handleChange('unauthorizedAbsences', val)}
          helperText="If Yes, Number of Incidents"
        />
        
        <QuestionField
          question="Was any staff member asked to step away from duty due to misconduct or unsafe practice?"
          value={data.staffRemoved}
          onChange={(val) => handleChange('staffRemoved', val)}
          helperText="If Yes, Number of instances"
        />
      </div>
    </div>
  );
}
