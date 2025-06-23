"use client";

import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CameraIcon, EyeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import Button from '@/app/components/ui/Button';
import { useTheme } from '@/app/components/ThemeProvider';

// Predefined color themes
const colorThemes = [
  {
    id: 'professional-blue',
    name: 'Professional Blue',
    primary: '#2563eb',
    secondary: '#1e40af',
    description: 'Classic blue for corporate environments'
  },
  {
    id: 'modern-orange',
    name: 'Modern Orange',
    primary: '#f97316',
    secondary: '#ea580c',
    description: 'Vibrant orange for creative businesses'
  },
  {
    id: 'elegant-purple',
    name: 'Elegant Purple',
    primary: '#7c3aed',
    secondary: '#6d28d9',
    description: 'Sophisticated purple for luxury brands'
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    primary: '#16a34a',
    secondary: '#15803d',
    description: 'Fresh green for eco-friendly businesses'
  },
  {
    id: 'bold-red',
    name: 'Bold Red',
    primary: '#dc2626',
    secondary: '#b91c1c',
    description: 'Powerful red for high-impact brands'
  },
  {
    id: 'minimal-gray',
    name: 'Minimal Gray',
    primary: '#6b7280',
    secondary: '#4b5563',
    description: 'Clean gray for minimalist designs'
  }
];

interface BrandingData {
  companyLogo?: string;
  selectedTheme: string;
}

interface ThemeColors {
  primary: string;
  secondary: string;
}

// Function to generate CSS for brand colors (same as in ThemeProvider)
const generateBrandCSS = (themeColors: ThemeColors) => {
  return `
    .bg-brand-start { background-color: ${themeColors.primary} !important; }
    .bg-brand-end { background-color: ${themeColors.secondary} !important; }
    .text-brand-start { color: ${themeColors.primary} !important; }
    .text-brand-end { color: ${themeColors.secondary} !important; }
    .border-brand-start { border-color: ${themeColors.primary} !important; }
    .ring-brand-start { --tw-ring-color: ${themeColors.primary} !important; }
    
    .bg-gradient-to-r.from-brand-start.to-brand-end {
      background-image: linear-gradient(to right, ${themeColors.primary}, ${themeColors.secondary}) !important;
    }
    
    .hover\\:bg-brand-start\\/90:hover { background-color: ${themeColors.primary} !important; }
    .hover\\:text-brand-start\\/90:hover { color: ${themeColors.primary} !important; }
    
    .focus\\:ring-brand-start:focus { --tw-ring-color: ${themeColors.primary} !important; }
    .focus\\:border-brand-start:focus { border-color: ${themeColors.primary} !important; }
  `;
};

// Function to inject CSS into the document
const injectCSS = (css: string, id: string) => {
  // Remove existing style tag if it exists
  const existingStyle = document.getElementById(id);
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create new style tag
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
};

export default function CompanyBrandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { refreshTheme } = useTheme();
  
  const [brandingData, setBrandingData] = useState<BrandingData>({
    companyLogo: '',
    selectedTheme: 'modern-orange' // Default to our current theme
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Load existing branding data
  useEffect(() => {
    const loadBrandingData = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const userData = await res.json();
          setBrandingData({
            companyLogo: userData.company_logo_url || '',
            selectedTheme: userData.brand_theme || 'modern-orange'
          });
          setPreviewUrl(userData.company_logo_url || null);
        }
      } catch {
        toast.error('Failed to load branding settings.');
      } finally {
        setIsLoadingData(false);
      }
    };

    if (session?.user) {
      loadBrandingData();
    } else {
      setIsLoadingData(false);
    }
  }, [session]);

  const handleThemeChange = (themeId: string) => {
    setBrandingData(prev => ({ ...prev, selectedTheme: themeId }));
    
    // Apply theme immediately for preview using CSS injection
    const themeColors = colorThemes.find(theme => theme.id === themeId);
    if (themeColors) {
      const css = generateBrandCSS(themeColors);
      injectCSS(css, 'preview-brand-theme');
    }
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
        body: JSON.stringify({ filename: file.name, folder: 'logos' }),
      });
      
      const { signedUrl, path } = await res.json();
      
      if (!signedUrl) throw new Error('Could not get a signed URL for upload.');
      
      toast.loading('Uploading logo...', { id: toastId });

      const uploadRes = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      
      if (!uploadRes.ok) {
        throw new Error(`Upload failed: ${uploadRes.status} ${uploadRes.statusText}`);
      }
      
      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path);
      
      if (!publicUrl) throw new Error("Could not get public URL for logo.");
      
      const finalUrl = `${publicUrl}?t=${new Date().getTime()}`;
      
      setBrandingData(prev => ({ ...prev, companyLogo: finalUrl }));
      setPreviewUrl(finalUrl);
      
      toast.success('Logo uploaded!', { id: toastId });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Upload failed: ${errorMessage}`, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return toast.error("Please wait for the logo to finish uploading.");
    
    setIsLoading(true);
    const toastId = toast.loading("Saving branding settings...");

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          company_logo_url: brandingData.companyLogo,
          brand_theme: brandingData.selectedTheme,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong.');
      }
      
      // Refresh the theme throughout the app
      refreshTheme();
      
      toast.success('Branding settings saved!', { id: toastId });
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTheme = colorThemes.find(theme => theme.id === brandingData.selectedTheme);

  if (isLoadingData) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-neutral-800 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-neutral-800 rounded mb-4 w-1/3"></div>
            <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded mb-8 w-1/2"></div>
            <div className="space-y-6">
              <div className="h-32 bg-gray-200 dark:bg-neutral-800 rounded"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 dark:bg-neutral-800 rounded"></div>
                ))}
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Company Branding</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Customize your logo and brand colors for a professional appearance.
        </p>
      </div>

      <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-neutral-800">
        {/* Logo Section */}
        <div className="p-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <CameraIcon className="h-5 w-5" />
            Company Logo
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative h-24 w-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-neutral-700 flex items-center justify-center">
              {previewUrl ? (
                <Image src={previewUrl} alt="Company logo" layout="fill" className="rounded-lg object-contain p-2" />
              ) : (
                <div className="text-center">
                  <CameraIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="text-xs text-gray-500 mt-1">No logo</p>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Upload your company logo to appear on invoices. Recommended size: 200x200px, max 5MB.
              </p>
              <div className="flex gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                  disabled={isUploading}
                />
                <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} loading={isUploading}>
                  Upload Logo
                </Button>
                {previewUrl && (
                  <Button type="button" variant="ghost" onClick={() => { setPreviewUrl(null); setBrandingData(p => ({...p, companyLogo: ''}))}}>
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Color Theme Section */}
        <div className="p-8 border-t border-gray-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <EyeIcon className="h-5 w-5" />
            Color Theme
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Choose a color theme that matches your brand identity.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {colorThemes.map((theme) => (
              <div
                key={theme.id}
                className={`
                  relative p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${brandingData.selectedTheme === theme.id
                    ? 'border-brand-start bg-brand-start/5'
                    : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
                  }
                `}
                onClick={() => handleThemeChange(theme.id)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: theme.secondary }}
                  />
                </div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  {theme.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {theme.description}
                </p>
                {brandingData.selectedTheme === theme.id && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-brand-start rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Theme Preview */}
          {selectedTheme && (
            <div className="mt-6 p-4 rounded-lg border border-gray-200 dark:border-neutral-700">
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Preview</h4>
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: selectedTheme.primary }}
                >
                  A
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedTheme.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Primary: {selectedTheme.primary} • Secondary: {selectedTheme.secondary}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-8 py-4 bg-gray-50 dark:bg-black/50 border-t border-gray-200 dark:border-neutral-800 flex justify-end">
          <Button type="submit" loading={isLoading || isUploading} disabled={isLoading || isUploading}>
            Save Branding Settings
          </Button>
        </div>
      </div>
    </form>
  );
} 