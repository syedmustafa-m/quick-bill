"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { EnvelopeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Button from "@/app/components/ui/Button";

export default function VerificationPendingPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg px-8 py-10 border border-gray-200 dark:border-neutral-800 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-brand-start to-brand-end rounded-full flex items-center justify-center mb-6">
            <EnvelopeIcon className="h-8 w-8 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Check your email
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We&apos;ve sent a verification link to{" "}
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {email || "your email address"}
            </span>
          </p>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Click the verification link in your email to activate your account and start using InvGen.
            </p>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button className="text-brand-start hover:text-brand-end font-medium">
                resend verification email
              </button>
            </p>
            
            <div className="pt-4 border-t border-gray-200 dark:border-neutral-700">
              <Link href="/auth/signin">
                <Button variant="outline" leftIcon={<ArrowLeftIcon className="h-4 w-4" />}>
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 