import { supabase } from './supabase';

/**
 * Uploads a user's avatar to Supabase Storage.
 *
 * @param userId - The ID of the user.
 * @param file - The file to upload.
 * @returns The public URL of the uploaded file.
 * @throws An error if the upload fails.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const fileExtension = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${fileExtension}`;

  // Upload the file, overwriting if it already exists
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    console.error('Error object from Supabase:', uploadError);
    throw uploadError; // Re-throw the original Supabase error
  }

  // Get the public URL for the uploaded file
  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

  if (!data.publicUrl) {
    throw new Error('Could not get public URL for avatar.');
  }

  // Add a timestamp to the URL to bypass browser cache
  return `${data.publicUrl}?t=${new Date().getTime()}`;
}
