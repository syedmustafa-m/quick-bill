"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "@/app/components/ui/Input";
import Label from "@/app/components/ui/Label";
import Button from "@/app/components/ui/Button";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import FieldGroup from "@/app/components/ui/FieldGroup";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const aError = searchParams.get("error");

  useEffect(() => {
    if (aError) {
      setErrors({ email: "You need to verify your email before you can sign in." });
    }
  }, [aError]);

  const validate = (field?: string) => {
    const newErrors: { [k: string]: string } = {};
    if (!form.email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) newErrors.email = "Invalid email address.";
    if (!form.password) newErrors.password = "Password is required.";
    if (field) return { [field]: newErrors[field] };
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, ...validate(name) }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, ...validate(name) }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setErrors({ password: "The email or password you entered is incorrect." });
        } else {
          setErrors({ email: result.error });
        }
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setErrors({ password: "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg px-8 py-10 border border-gray-200 dark:border-neutral-800">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
            Sign in to your account
          </h2>
          <p className="mb-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-brand-start hover:text-brand-end"
            >
              create a new account
            </Link>
          </p>
          
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              <Label htmlFor="email" required>Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && errors.email ? errors.email : undefined}
                placeholder="Enter your email address"
              />
            </FieldGroup>
            
            <FieldGroup>
              <Label htmlFor="password" required>Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && errors.password ? errors.password : undefined}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </FieldGroup>

            <Button type="submit" className="w-full mt-2" loading={isLoading}>
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 