"use client";

import Link from "next/link";
import { CheckCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import Button from "@/app/components/ui/Button";

export default function EmailVerifiedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg px-8 py-10 border border-gray-200 dark:border-neutral-800 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
            <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Email Verified!
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your email address has been successfully verified. Your account is now active and ready to use.
          </p>
          
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800 dark:text-green-200">
              Welcome to InvGen! You can now create invoices, manage clients, and track your business finances.
            </p>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Ready to get started? Sign in to your account and begin creating your first invoice.
            </p>
            
            <Link href="/auth/signin">
              <Button rightIcon={<ArrowRightIcon className="h-4 w-4" />}>
                Sign In to Your Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 