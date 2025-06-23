"use client";

import { signOut } from "next-auth/react";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/auth/signin' })}
      className="w-full text-left"
    >
      <div className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors dark:text-gray-300 dark:hover:bg-neutral-900 dark:hover:text-gray-100">
        <ArrowLeftOnRectangleIcon className="mr-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
        Sign out
      </div>
    </button>
  );
} 