'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CarivueLogo } from '@/components/ui/CarivueLogo';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < 4) {
      setError('Please enter the full 4-digit code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await apiFetch(`/auth/verify-email/${fullCode}`, { method: 'GET' });
      router.push('/create-organisation'); 
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center max-w-md mx-auto pt-10">
      <CarivueLogo className="mb-12" />

      <h1 className="text-2xl font-bold text-text mb-2">Verify your Email Address</h1>
      <p className="text-sm text-gray-400 mb-8">
        Enter the 4 digit code sent to your email address
      </p>

      <form onSubmit={handleSubmit} className="w-full">
        <label className="block text-sm font-semibold text-text mb-4 text-left">
          Verification Code
        </label>
        
        <div className="flex justify-between gap-3 mb-6">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-full h-14 text-center text-2xl font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          ))}
        </div>

        {error && (
          <p className="text-error text-sm mb-4 text-left">{error}</p>
        )}

        <p className="text-sm text-gray-500 mb-8 text-left">
          Didn't receive code? <button type="button" className="text-secondary font-semibold hover:underline">Resend code</button>
        </p>

        <Button type="submit" disabled={loading} className="w-full bg-[#1B2936] hover:bg-[#2c3d4f]">
          {loading ? 'Verifying...' : 'Verify Email'}
        </Button>
      </form>
    </div>
  );
}
