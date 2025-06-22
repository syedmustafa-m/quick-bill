"use client";

import { signOut } from "next-auth/react";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/auth/signin' })}
      className="w-full text-left"
    >
      <div className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 hover:text-brand-blue rounded-md">
        <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-brand-blue" />
        Log out
      </div>
    </button>
  );
} 