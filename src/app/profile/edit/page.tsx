"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ErrorBox from '@/app/components/ErrorBox';

export default function EditProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState(session?.user?.name || '');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      // Update the session with the new user data
      await update({ ...session, user: { ...session?.user, name } });
      router.push('/profile/edit');
      router.refresh(); // Refresh the page to show updated info
    } else {
      const data = await res.json();
      setError(data.error || 'Something went wrong.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        {error && <ErrorBox message={error} />}
        
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-brand-blue focus:border-brand-blue"
            required
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold text-white bg-brand-blue rounded-md hover:bg-brand-blue/90"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
} 