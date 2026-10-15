'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ProfileSettings({ initialName, email }: { initialName: string; email: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch('/api/settings/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
      const result = await response.json().catch(() => null) as { message?: string; user?: { name: string | null } } | null;
      if (!response.ok || !result?.user) {
        setError(result?.message ?? 'Profile could not be updated.');
        return;
      }
      setName(result.user.name ?? '');
      setMessage('Profile updated.');
      window.dispatchEvent(new CustomEvent('studymate-profile-updated', { detail: result.user.name ?? '' }));
      router.refresh();
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <header><p className="text-sm font-medium text-primary">ACCOUNT</p><h1 className="mt-1 text-3xl font-semibold">Settings</h1><p className="mt-2 text-sm text-muted-foreground">Manage profile details and display preferences.</p></header>
      <section className="border-y border-border py-5"><h2 className="font-semibold">Profile</h2><form onSubmit={saveProfile} className="mt-5 max-w-lg space-y-4" aria-busy={loading}><div className="space-y-2"><label htmlFor="profile-name" className="text-sm font-medium">Name</label><Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={100} required disabled={loading} /></div><div className="space-y-2"><label htmlFor="profile-email" className="text-sm font-medium">Email</label><Input id="profile-email" type="email" value={email} readOnly disabled className="opacity-70" /><p className="text-xs text-muted-foreground">Email changes are not available in this version.</p></div>{message && <p role="status" className="text-sm text-green-700 dark:text-green-300">{message}</p>}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button type="submit" disabled={loading || !name.trim()} className="gap-2">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{loading ? 'Saving…' : 'Save profile'}</Button></form></section>
      <section className="border-b border-border pb-5"><h2 className="font-semibold">Appearance</h2><p className="mt-2 text-sm text-muted-foreground">Choose a theme from the header. Your selection is saved in this browser.</p></section>
    </div>
  );
}
