'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CarivueLogo } from '@/components/ui/CarivueLogo';
import { Button } from '@/components/ui/Button';
import { OtpInput } from '@/components/ui/OtpInput';
import { Input } from '@/components/ui/Input';
import { apiFetch } from '@/lib/api';

function JoinOrganisationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const hasInvitationToken = typeof token === 'string' && token.trim().length > 0;

  const [invitation, setInvitation] = useState<any>(null);
  const [code, setCode] = useState<string[]>(['', '', '', '']);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingInvite, setFetchingInvite] = useState(hasInvitationToken);
  const [inviteLookupFailed, setInviteLookupFailed] = useState(false);

  const redirectByRole = (roleValue?: string) => {
    const role = (roleValue || 'executive').toLowerCase();

    if (role === 'coordinator' || role === 'care coordinator') {
      router.push('/signal-input');
    } else if (role === 'manager') {
      router.push('/dashboard/manager');
    } else {
      router.push('/dashboard/executive');
    }
  };

  useEffect(() => {
    if (hasInvitationToken) {
      fetchInvitation();
    }
  }, [hasInvitationToken, token]);

  const fetchInvitation = async () => {
    setFetchingInvite(true);
    setInviteLookupFailed(false);
    setError('');
    try {
      console.log("fetching");
      const data = await apiFetch<any>(`/settings/invitation/${token}`);
      setInvitation(data);
    } catch (err: any) {
      console.log(err);
      setInvitation(null);
      setInviteLookupFailed(true);
      setError('This invitation link is invalid or has expired.');
    } finally {
      setFetchingInvite(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await apiFetch<any>('/settings/invitation/accept', {
        method: 'POST',
        body: JSON.stringify({
          token,
          ...formData
        }),
      });

      // Save token and redirect
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      redirectByRole(result.user?.role);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const inviteCode = code.join('');
    if (inviteCode.length < 4) {
      setError('Please enter the full 4 digit code');
      return;
    }

    setLoading(true);

    try {
      const authToken = localStorage.getItem('token');
      const result = await apiFetch<any>('/organisations/join', {
        method: 'POST',
        body: JSON.stringify({ inviteCode }),
        token: authToken || undefined,
      });

      redirectByRole(result.user?.role);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (hasInvitationToken && fetchingInvite) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-sm text-gray-500">Loading invitation...</p>
      </div>
    );
  }

  if (hasInvitationToken && inviteLookupFailed) {
    return (
      <div>
        <CarivueLogo className="mb-6" />

        <h1 className="text-2xl font-bold text-text">Invitation Unavailable</h1>
        <p className="text-sm text-gray-500 mb-6">
          This invite link is no longer valid. Ask your manager or executive to send a new invitation.
        </p>

        {error && (
          <div className="bg-error/10 text-error text-sm p-3 rounded-md mb-6">{error}</div>
        )}

        <div className="space-y-3">
          <Button type="button" onClick={() => fetchInvitation()} disabled={fetchingInvite}>
            {fetchingInvite ? 'Retrying...' : 'Retry Invitation'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/signin')}>
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <CarivueLogo className="mb-6" />

      {hasInvitationToken && invitation ? (
        <>
          <h1 className="text-2xl font-bold text-text">Join {invitation.organisation_name}</h1>
          <p className="text-sm text-gray-500 mb-8 font-medium">
            You&apos;ve been invited to join as a <span className="text-secondary font-bold font-mono">{invitation.role}</span>
          </p>

          {(invitation.siteNames?.length > 0 || invitation.unitNames?.length > 0) && (
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6 text-sm text-left">
              <p className="font-bold text-text mb-2">Assigned Access</p>
              {invitation.siteNames?.length > 0 && (
                <p className="text-gray-600">
                  Sites: <span className="font-medium">{invitation.siteNames.join(', ')}</span>
                </p>
              )}
              {invitation.unitNames?.length > 0 && (
                <p className="text-gray-600 mt-1">
                  Units: <span className="font-medium">{invitation.unitNames.join(', ')}</span>
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="bg-error/10 text-error text-sm p-3 rounded-md mb-6">{error}</div>
          )}

          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
              <Input
                label="Last Name"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>

            <Input
              label="Email Address"
              value={invitation.email}
              disabled
              type="email"
            />

            <Input
              label="Create Password"
              placeholder="Min. 8 characters"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <div className="pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Setting up account...' : 'Accept Invitation & Join'}
              </Button>
            </div>
          </form>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-text">Join an Existing Organisation</h1>
          <p className="text-sm text-gray-500 mb-2 font-medium">Organisation invite code</p>

          <h2 className="text-lg font-bold text-text mt-4">What&apos;s your invite code?</h2>
          <p className="text-sm text-gray-500 mb-4">Enter the 4 digit code sent to your email address</p>

          {error && (
            <div className="bg-error/10 text-error text-sm p-3 rounded-md mb-4">{error}</div>
          )}

          <form onSubmit={handleOtpSubmit}>
            <div className="mb-2">
              <label className="block text-sm font-semibold text-text mb-2">Verification Code</label>
              <OtpInput value={code} onChange={setCode} />
            </div>

            <p className="text-sm text-gray-500 mb-6 font-medium">
              Didn&apos;t receive code?{' '}
              <button type="button" className="text-secondary font-semibold hover:underline">Resend code</button>
            </p>

            <Button type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Finish Setup'}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}

export default function JoinOrganisationPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <JoinOrganisationContent />
    </Suspense>
  );
}
