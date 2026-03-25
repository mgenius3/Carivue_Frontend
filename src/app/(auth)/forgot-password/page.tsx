'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CarivueLogo } from '@/components/ui/CarivueLogo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      // Store email for the confirmation screen
      sessionStorage.setItem('resetEmail', email);
      router.push('/password-reset-sent');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <CarivueLogo className="mb-6" />

      <h1 className="text-2xl font-bold text-text">Reset Your Password</h1>
      <p className="text-sm text-gray-500 mb-6">
        Enter your email and we&apos;ll send you instruction to reset your password
      </p>

      {error && (
        <div className="bg-error/10 text-error text-sm p-3 rounded-md mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your work email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Reset Password'}
        </Button>
      </form>
    </div>
  );
}
