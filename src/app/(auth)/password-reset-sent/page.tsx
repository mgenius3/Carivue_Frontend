'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CarivueLogo } from '@/components/ui/CarivueLogo';
import { Button } from '@/components/ui/Button';
import { CheckCircle } from 'lucide-react';

export default function PasswordResetSentPage() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('resetEmail');
    if (stored) setEmail(stored);
  }, []);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center mb-6">
        <CheckCircle size={32} className="text-primary" />
      </div>

      <h1 className="text-2xl font-bold text-text mb-3">Password Reset</h1>
      <p className="text-sm text-gray-500 mb-8">
        We have sent an email containing password reset instructions to{' '}
        <span className="font-medium">{email || 'your email'}</span>.
        Kindly check your email and follow the instruction to reset your password.
      </p>

      <Link href="/signin" className="w-full">
        <Button>Return to Sign In</Button>
      </Link>

      <p className="text-sm text-gray-500 mt-4">
        Didn&apos;t receive the email?{' '}
        <button className="text-secondary font-semibold hover:underline">Resend</button>
      </p>

      <CarivueLogo className="mt-8" />
    </div>
  );
}
