'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CarivueLogo } from '@/components/ui/CarivueLogo';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { apiFetch } from '@/lib/api';
import { Eye, EyeOff, Info } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'executive',
    proceedIntent: 'new_org',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!agreed) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      const result = await apiFetch<{ token: string }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          role: form.role,
          proceedIntent: form.proceedIntent,
        }),
      });

      localStorage.setItem('token', result.token);
      router.push('/signup-success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <CarivueLogo className="mb-6" />

      <h1 className="text-2xl font-bold text-text">Create Your Account</h1>
      <p className="text-sm text-gray-500 mb-6">Sign up to access the Carivue platform</p>

      {error && (
        <div className="bg-error/10 text-error text-sm p-3 rounded-md mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name*"
            placeholder="Enter your first name"
            value={form.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            required
          />
          <Input
            label="Last Name*"
            placeholder="Enter your last name"
            value={form.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            required
          />
        </div>

        <Input
          label="Email Address*"
          type="email"
          placeholder="Enter your work email address"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          required
        />


        <Input
          label="Password*"
          type={showPassword ? 'text' : 'password'}
          placeholder="Create a password"
          value={form.password}
          onChange={(e) => handleChange('password', e.target.value)}
          required
          rightElement={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />
        <p className="text-xs text-gray-400 -mt-3 mb-4">
          Password must be at least 8 characters with uppercase, lowercase, number and a special character
        </p>

        <Input
          label="Confirm Password*"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Confirm your password"
          value={form.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          required
          rightElement={
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600">
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        <label className="flex items-start gap-2 text-sm text-text mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 accent-primary"
          />
          <span>
            I agree to the{' '}
            <Link href="#" className="text-secondary hover:underline">Terms of Service</Link>{' '}
            and{' '}
            <Link href="#" className="text-secondary hover:underline">Privacy Policy</Link>
          </span>
        </label>

        <div className="flex items-start gap-2 bg-blue-50 text-blue-700 text-xs p-3 rounded-md mb-5">
          <Info size={16} className="shrink-0 mt-0.5" />
          <span>You can complete your organisation setup after creating your account.</span>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-5">
        Already have an account?{' '}
        <Link href="/signin" className="text-secondary font-semibold hover:underline">Sign In</Link>
      </p>
    </div>
  );
}
