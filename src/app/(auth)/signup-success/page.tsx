'use client';

import React from 'react';
import Link from 'next/link';
import { CarivueLogo } from '@/components/ui/CarivueLogo';
import { Button } from '@/components/ui/Button';
import { Mail, ArrowRight } from 'lucide-react';

export default function SignupSuccessPage() {
  return (
    <div className="flex flex-col items-center text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
        <Mail size={32} className="text-secondary" />
      </div>

      <h1 className="text-2xl font-bold text-text mb-3">Check Your Email</h1>
      <p className="text-sm text-gray-500 mb-8">
        We've sent a 4-digit verification code to your email address. Please enter the code on the next screen to verify your account.
      </p>

      <div className="bg-blue-50 text-blue-700 text-xs p-4 rounded-md mb-8 text-left w-full">
        <p className="font-bold mb-1">Developer Note:</p>
        <p>Since the email service is not yet connected, you can find the 4-digit code in the <strong>backend terminal console</strong>.</p>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <Link href="/verify-email">
          <Button className="w-full">Continue to Verification</Button>
        </Link>
        
        <p className="text-sm text-gray-400 mt-4">
          Didn't receive the email? Check your spam folder or{' '}
          <button className="text-secondary font-semibold hover:underline">Resend Email</button>
        </p>

        <Link 
          href="/signin" 
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-text hover:text-primary transition mt-4"
        >
          Back to Sign In <ArrowRight size={16} />
        </Link>
      </div>

      <CarivueLogo className="mt-12" />
    </div>
  );
}
