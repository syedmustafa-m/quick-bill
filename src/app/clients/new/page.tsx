"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast';
import Button from "@/app/components/ui/Button";
import FieldGroup from "@/app/components/ui/FieldGroup";
import Input from "@/app/components/ui/Input";
import Label from "@/app/components/ui/Label";
import Textarea from "@/app/components/ui/Textarea";

export default function NewClientPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Client created successfully!");
        router.push("/clients");
        router.refresh();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to create client.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Add New Client</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create a new client to start generating invoices.
          </p>
        </div>
        <div>
          <Button asChild variant="ghost">
            <Link href="/clients">
              &larr; Back to all clients
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-neutral-800 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FieldGroup>
              <Label htmlFor="companyName" required>Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="e.g., Acme Inc."
              />
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="contactName" required>Contact Name</Label>
              <Input
                id="contactName"
                name="contactName"
                required
                value={formData.contactName}
                onChange={handleInputChange}
                placeholder="e.g., John Doe"
              />
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="email" required>Email Address</Label>
              <Input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="e.g., contact@acme.com"
              />
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(123) 456-7890"
              />
            </FieldGroup>

            <FieldGroup className="md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                rows={4}
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main St, Anytown, USA"
              />
            </FieldGroup>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-neutral-800">
            <Button type="button" variant="secondary" onClick={() => router.push('/clients')}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
            >
              Create Client
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 