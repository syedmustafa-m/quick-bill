"use client";

import { signOut } from "next-auth/react";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";

export default function SignOutButton() {
  const handleSignOut = () => {
    // Clear any stored theme data from localStorage
    try {
      localStorage.removeItem('user-theme');
    } catch {
      // Silently handle error if localStorage is not available
    }
    
    signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <button
      onClick={handleSignOut}
      className="w-full text-left"
    >
      <div className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200 dark:text-gray-300 dark:hover:bg-neutral-900 dark:hover:text-gray-100 gap-3">
        <div className="flex items-center justify-center w-5 h-5">
          <ArrowLeftOnRectangleIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        </div>
        <span className="font-medium">Sign out</span>
      </div>
    </button>
  );
} 