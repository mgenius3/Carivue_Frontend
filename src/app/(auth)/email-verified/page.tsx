'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CarivueLogo } from '@/components/ui/CarivueLogo';
import { Button } from '@/components/ui/Button';
import { CheckCircle } from 'lucide-react';

export default function EmailVerifiedPage() {
  const router = useRouter();

  const handleContinue = () => {
    // Check user's proceed_intent from localStorage or API
    // For now, route to create-organisation
    router.push('/create-organisation');
  };

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center mb-6">
        <CheckCircle size={32} className="text-primary" />
      </div>

      <h1 className="text-2xl font-bold text-text mb-3">Email Verified Successfully</h1>
      <p className="text-sm text-gray-500 mb-8">
        Your email has been verified! Kindly click the button below to continue your organisation registration.
      </p>

      <Button onClick={handleContinue}>Continue Organisation Registration</Button>

      <CarivueLogo className="mt-8" />
    </div>
  );
}
