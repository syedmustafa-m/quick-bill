"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/app/components/ui/Input";
import Label from "@/app/components/ui/Label";
import Button from "@/app/components/ui/Button";
import FieldGroup from "@/app/components/ui/FieldGroup";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const passwordRequirements = [
  { label: "At least 8 characters", test: (pw: string) => pw.length >= 8 },
  { label: "At least one uppercase letter", test: (pw: string) => /[A-Z]/.test(pw) },
  { label: "At least one lowercase letter", test: (pw: string) => /[a-z]/.test(pw) },
  { label: "At least one number", test: (pw: string) => /[0-9]/.test(pw) },
  { label: "At least one special character", test: (pw: string) => /[^A-Za-z0-9]/.test(pw) },
];

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const validate = (field?: string) => {
    const newErrors: { [k: string]: string } = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!form.companyName.trim()) newErrors.companyName = "Company name is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) newErrors.email = "Invalid email address.";
    if (!form.password) newErrors.password = "Password is required.";
    else {
      for (const req of passwordRequirements) {
        if (!req.test(form.password)) {
          newErrors.password = req.label;
          break;
        }
      }
    }
    if (!form.confirmPassword) newErrors.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
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
    if (name === 'password') {
      setIsPasswordFocused(false);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    if (name === 'password') {
      setIsPasswordFocused(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ firstName: true, lastName: true, companyName: true, email: true, password: true, confirmPassword: true });
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`,
          email: form.email,
          password: form.password,
        }),
      });
      if (res.ok) {
        router.push(`/auth/verification-pending?email=${encodeURIComponent(form.email)}`);
      } else {
        const data = await res.json();
        if (data?.field && data?.message) {
          setErrors((prev) => ({ ...prev, [data.field]: data.message }));
        } else if (data?.message) {
          setErrors((prev) => ({ ...prev, email: data.message }));
        } else {
          setErrors((prev) => ({ ...prev, email: "An error occurred. Please try again." }));
        }
      }
    } catch {
      setErrors((prev) => ({ ...prev, email: "An error occurred. Please try again." }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex gap-8 items-start">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg px-8 py-10 border border-gray-200 dark:border-neutral-800">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">Create your account</h2>
          <p className="mb-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link href="/auth/signin" className="font-medium text-brand-start hover:text-brand-end">
              sign in to your existing account
            </Link>
          </p>
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="flex gap-4">
              <FieldGroup className="flex-1">
                <Label htmlFor="firstName" required>First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.firstName && errors.firstName ? errors.firstName : undefined}
                  placeholder="Enter your first name"
                />
              </FieldGroup>
              <FieldGroup className="flex-1">
                <Label htmlFor="lastName" required>Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.lastName && errors.lastName ? errors.lastName : undefined}
                  placeholder="Enter your last name"
                />
              </FieldGroup>
            </div>
            <FieldGroup>
              <Label htmlFor="companyName" required>Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                autoComplete="organization"
                value={form.companyName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.companyName && errors.companyName ? errors.companyName : undefined}
                placeholder="Enter your company name"
              />
            </FieldGroup>
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
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onFocus={handleFocus}
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
            <FieldGroup>
              <Label htmlFor="confirmPassword" required>Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : undefined}
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            </FieldGroup>
            <Button type="submit" className="w-full mt-2" loading={isLoading}>
              Create account
            </Button>
          </form>
        </div>
        {isPasswordFocused && (
          <div className="w-80 bg-white dark:bg-neutral-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-neutral-800">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Password Requirements</h4>
            <ul className="space-y-3">
              {passwordRequirements.map((req) => (
                <li key={req.label} className={`flex items-center text-sm ${req.test(form.password) ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}>
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full mr-3 text-xs font-medium ${req.test(form.password) ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400" : "bg-gray-100 dark:bg-neutral-800 text-gray-400"}`}>
                    {req.test(form.password) ? "✓" : "✗"}
                  </span>
                  {req.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 