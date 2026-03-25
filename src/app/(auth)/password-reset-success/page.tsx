'use client';

import React from 'react';
import Link from 'next/link';
import { CarivueLogo } from '@/components/ui/CarivueLogo';
import { Button } from '@/components/ui/Button';
import { CheckCircle } from 'lucide-react';

export default function PasswordResetSuccessPage() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center mb-6">
        <CheckCircle size={32} className="text-primary" />
      </div>

      <h1 className="text-2xl font-bold text-text mb-3">Password Reset Successful</h1>
      <p className="text-sm text-gray-500 mb-8">
        Your password has been successfully reset.<br />
        You can now sign in with your new password.
      </p>

      <Link href="/signin" className="w-full">
        <Button>Go to Sign In</Button>
      </Link>

      <CarivueLogo className="mt-8" />
    </div>
  );
}
