"use client";

import { useState, useRef, useEffect, ChangeEvent, FormEvent } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CameraIcon, UserCircleIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import Label from '@/app/components/ui/Label';
import FieldGroup from '@/app/components/ui/FieldGroup';
import ConfirmationModal from '@/app/components/ConfirmationModal';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  designation: string;
  department: string;
  companyName: string;
  profilePicture?: string;
}

export default function EditProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: session?.user?.email || '',
    designation: '',
    department: '',
    companyName: '',
    profilePicture: session?.user?.image || '',
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(session?.user?.image || null);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const userData = await res.json();
          setProfileData({
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
            email: userData.email || '',
            designation: userData.designation || '',
            department: userData.department || '',
            companyName: userData.company_name || '',
            profilePicture: userData.profile_picture_url || session?.user?.image || '',
          });
          setPreviewUrl(userData.profile_picture_url || session?.user?.image || null);
        } else {
          throw new Error("Failed to fetch profile data");
        }
      } catch {
        toast.error('Failed to load profile data.');
      } finally {
        setIsLoadingData(false);
      }
    };

    if (session?.user) {
      loadProfileData();
    } else {
      setIsLoadingData(false);
    }
  }, [session]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user?.id) return;

    if (!file.type.startsWith('image/')) return toast.error('Please select an image file.');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image size must be less than 5MB.');

    setIsUploading(true);
    const toastId = toast.loading('Preparing to upload...');

    try {
      const res = await fetch('/api/profile/signed-upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name }),
      });

      const { signedUrl, path } = await res.json();
      if (!signedUrl) throw new Error('Could not get a signed URL for upload.');

      toast.loading('Uploading avatar...', { id: toastId });

      await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      if (!publicUrl) throw new Error("Could not get public URL for avatar.");

      const finalUrl = `${publicUrl}?t=${new Date().getTime()}`;
      setProfileData(prev => ({ ...prev, profilePicture: finalUrl }));
      setPreviewUrl(finalUrl);

      toast.success('Avatar uploaded!', { id: toastId });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isUploading) return toast.error("Please wait for the image to finish uploading.");

    setIsLoading(true);
    const toastId = toast.loading("Saving profile...");

    try {
      const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          designation: profileData.designation,
          department: profileData.department,
          companyName: profileData.companyName,
          profile_picture_url: profileData.profilePicture,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong.');
      }

      await update({
        user: {
          name: fullName,
          image: profileData.profilePicture,
        }
      });
      toast.success('Profile updated successfully!', { id: toastId });
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('/api/profile', { method: 'DELETE' });
      if (res.ok) {
        toast.success('Account deleted successfully');
        await signOut({ callbackUrl: '/' });
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to delete account');
      }
    } catch {
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setDeleteEmail('');
    }
  };

  if (isLoadingData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-neutral-800 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-neutral-800 rounded mb-4 w-1/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded mb-8 w-1/2"></div>
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 bg-gray-200 dark:bg-neutral-800 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-6 w-32 bg-gray-200 dark:bg-neutral-800 rounded"></div>
                  <div className="h-6 w-24 bg-gray-200 dark:bg-neutral-800 rounded"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-neutral-800">
                <div className="h-14 bg-gray-200 dark:bg-neutral-800 rounded"></div>
                <div className="h-14 bg-gray-200 dark:bg-neutral-800 rounded"></div>
                <div className="h-14 bg-gray-200 dark:bg-neutral-800 rounded"></div>
                <div className="h-14 bg-gray-200 dark:bg-neutral-800 rounded"></div>
                <div className="h-14 bg-gray-200 dark:bg-neutral-800 rounded"></div>
                <div className="h-14 bg-gray-200 dark:bg-neutral-800 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit Profile</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Update your personal information and preferences.
        </p>
      </div>

      <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-neutral-800">
        <div className="p-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <CameraIcon className="h-5 w-5" />
            Profile Picture
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative h-24 w-24 rounded-full">
              {previewUrl ? (
                <Image src={previewUrl} alt="Profile preview" layout="fill" className="rounded-full object-cover" />
              ) : (
                <UserCircleIcon className="h-full w-full text-gray-300" />
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
              disabled={isUploading}
            />
            <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} loading={isUploading}>
              Change
            </Button>
            <Button type="button" variant="ghost" onClick={() => { setPreviewUrl(null); setProfileData(p => ({ ...p, profilePicture: '' })) }}>
              Remove
            </Button>
          </div>
        </div>

        <div className="p-8 border-t border-gray-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <UserCircleIcon className="h-5 w-5" />
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FieldGroup>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" type="text" value={profileData.firstName} onChange={handleInputChange} autoComplete="given-name" />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" type="text" value={profileData.lastName} onChange={handleInputChange} autoComplete="family-name" />
            </FieldGroup>
            <FieldGroup className="md:col-span-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" value={profileData.email} disabled className="cursor-not-allowed" />
            </FieldGroup>
          </div>
        </div>

        <div className="p-8 border-t border-gray-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <BuildingOfficeIcon className="h-5 w-5" />
            Professional Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FieldGroup>
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" name="companyName" type="text" value={profileData.companyName} onChange={handleInputChange} />
            </FieldGroup>
            <FieldGroup>
              <Label htmlFor="department">Department</Label>
              <Input id="department" name="department" type="text" value={profileData.department} onChange={handleInputChange} />
            </FieldGroup>
            <FieldGroup className='md:col-span-2'>
              <Label htmlFor="designation">Designation</Label>
              <Input id="designation" name="designation" type="text" value={profileData.designation} onChange={handleInputChange} />
            </FieldGroup>
          </div>
        </div>

        <div className="px-8 py-4 bg-gray-50 dark:bg-black/50 border-t border-gray-200 dark:border-neutral-800 flex justify-end">
          <Button type="submit" loading={isLoading || isUploading} disabled={isLoading || isUploading}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-neutral-800">
        <div className="p-6 border-t border-gray-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Danger Zone
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button
            type="button"
            variant="danger"
            onClick={() => setIsDeleteModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 px-6 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200"
          >
            Delete Account
          </Button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setDeleteEmail(''); }}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message={
          <span>
            This action is <b>permanent</b> and cannot be undone.<br />
            Please type your email <b>({profileData.email})</b> to confirm deletion.<br />
            <input
              type="email"
              className="mt-4 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 dark:bg-black dark:border-neutral-700 dark:text-gray-100"
              placeholder="Enter your email to confirm"
              value={deleteEmail}
              onChange={e => setDeleteEmail(e.target.value)}
              disabled={isDeleting}
            />
          </span>
        }
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        confirmDisabled={deleteEmail !== profileData.email || isDeleting}
      />
    </form>
  );
} 