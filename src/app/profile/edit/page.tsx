"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import ErrorBox from "@/app/components/ErrorBox";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      setName(session.user?.name ?? "");
      setEmail(session.user?.email ?? "");
    }
  }, [session]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Here you would typically handle the upload to your storage service
      console.log("File selected for upload:", file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (name.trim() === session.user.name) {
      setMessage('No changes made.');
      return;
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }
      
      setError(null);
      setMessage('Profile updated successfully!');
      // Trigger session update
      await update({
        ...session,
        user: {
          ...session.user,
          name: name,
        }
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!session) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Profile</h1>
        <div className="bg-white rounded-lg shadow-sm">
            <form onSubmit={handleSubmit}>
                <div className="p-8">
                    {error && <ErrorBox message={error} />}
                    {message && <div className="mb-4 p-4 text-sm text-green-700 bg-green-100 rounded-lg">{message}</div>}
                    
                    <div className="space-y-6">
                         <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <div className="mt-1">
                                <input
                                type="text"
                                name="name"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <div className="mt-1">
                                <input
                                type="email"
                                name="email"
                                id="email"
                                value={session.user.email ?? ''}
                                disabled
                                className="block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-gray-500 sm:text-sm cursor-not-allowed"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
                                Profile Photo
                            </label>
                            <div className="mt-2 flex items-center space-x-4">
                                <Image 
                                    src={session.user.image || `https://ui-avatars.com/api/?name=${session.user.name}&background=335fb3&color=fff`} 
                                    width={48} 
                                    height={48} 
                                    alt="User avatar" 
                                    className="rounded-full"
                                />
                                <button type="button" className="px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                    Change
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 px-8 py-4 text-right rounded-b-lg">
                    <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
} 