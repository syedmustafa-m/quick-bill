import Link from "next/link";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function VerifiedPage() {
  return (
    <div className="flex min-h-full flex-col justify-center bg-gray-100 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 text-center shadow sm:rounded-lg sm:px-10">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-6 text-center text-xl font-bold tracking-tight text-gray-900">
            Email Verified Successfully!
          </h2>
          <div className="mt-2">
            <p className="text-sm text-gray-600">
              Thank you for verifying your email address. You can now access all features.
            </p>
          </div>
          <div className="mt-6">
            <Link
              href="/auth/signin"
              className="flex w-full justify-center rounded-md bg-brand-blue px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-brand-blue/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
            >
              Proceed to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 