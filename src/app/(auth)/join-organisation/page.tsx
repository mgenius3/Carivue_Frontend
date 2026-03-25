'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CarivueLogo } from '@/components/ui/CarivueLogo';
import { Button } from '@/components/ui/Button';
import { OtpInput } from '@/components/ui/OtpInput';
import { apiFetch } from '@/lib/api';

export default function JoinOrganisationPage() {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const inviteCode = code.join('');
    if (inviteCode.length < 4) {
      setError('Please enter the full 4 digit code');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      await apiFetch('/organisations/join', {
        method: 'POST',
        body: JSON.stringify({ inviteCode }),
        token: token || undefined,
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <CarivueLogo className="mb-6" />

      <h1 className="text-2xl font-bold text-text">Join an Existing Organisation</h1>
      <p className="text-sm text-gray-500 mb-2">Organisation invite code</p>

      <h2 className="text-lg font-bold text-text mt-4">What&apos;s your invite code?</h2>
      <p className="text-sm text-gray-500 mb-4">Enter the 4 digit code sent to your email address</p>

      {error && (
        <div className="bg-error/10 text-error text-sm p-3 rounded-md mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label className="block text-sm font-semibold text-text mb-2">Verification Code</label>
          <OtpInput value={code} onChange={setCode} />
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Didn&apos;t receive code?{' '}
          <button type="button" className="text-secondary font-semibold hover:underline">Resend code</button>
        </p>

        <Button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Finish Setup'}
        </Button>
      </form>
    </div>
  );
}
