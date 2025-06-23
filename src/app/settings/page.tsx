"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BuildingOfficeIcon, 
  PaintBrushIcon,
  Cog6ToothIcon,
  UserIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/app/components/ThemeProvider';

const settingsSections = [
  {
    name: 'Company Branding',
    href: '/settings/company-branding',
    icon: PaintBrushIcon,
    description: 'Customize your logo and brand colors'
  },
  {
    name: 'Account Settings',
    href: '/settings/account',
    icon: UserIcon,
    description: 'Manage your account preferences',
    disabled: true
  },
  {
    name: 'Security',
    href: '/settings/security',
    icon: ShieldCheckIcon,
    description: 'Password and security settings',
    disabled: true
  },
  {
    name: 'Preferences',
    href: '/settings/preferences',
    icon: Cog6ToothIcon,
    description: 'Default invoice settings',
    disabled: true
  }
];

export default function SettingsPage() {
  const pathname = usePathname();
  const { currentTheme, themeColors, isLoading } = useTheme();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {settingsSections.map((section) => {
              const isActive = pathname === section.href;
              const Icon = section.icon;
              
              return (
                <Link
                  key={section.name}
                  href={section.disabled ? '#' : section.href}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-gradient-to-r from-brand-start to-brand-end text-white shadow-sm' 
                      : section.disabled
                      ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-900'
                    }
                  `}
                  onClick={section.disabled ? (e) => e.preventDefault() : undefined}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span>{section.name}</span>
                      {section.disabled && (
                        <span className="text-xs bg-gray-100 dark:bg-neutral-800 text-gray-500 px-2 py-1 rounded">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                      {section.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-neutral-800 p-8">
            <div className="text-center py-8">
              <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                Select a settings section
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                Choose a section from the menu to configure your settings.
              </p>
              
              {/* Current Theme Preview */}
              <div className="mt-8 p-4 rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Current Theme Preview</h4>
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-brand-start border-t-transparent rounded-full"></div>
                    <span className="text-sm text-gray-500">Loading theme...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 justify-center">
                    <div 
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: themeColors.primary }}
                    />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {currentTheme.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        Primary: {themeColors.primary}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <div 
                        className="w-6 h-6 rounded border border-gray-300 dark:border-neutral-600"
                        style={{ backgroundColor: themeColors.primary }}
                      />
                      <div 
                        className="w-6 h-6 rounded border border-gray-300 dark:border-neutral-600"
                        style={{ backgroundColor: themeColors.secondary }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 