"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

const menuItems = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Clients", href: "/clients", icon: UsersIcon },
  { name: "Invoices", href: "/invoices", icon: DocumentTextIcon },
];

const supportItems = [
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
  { name: "Help Center", href: "#", icon: QuestionMarkCircleIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  // Fetch company logo when session is available
  useEffect(() => {
    const fetchCompanyLogo = async () => {
      if (!session?.user) return;
      
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const userData = await res.json();
          if (userData.company_logo_url) {
            setCompanyLogo(userData.company_logo_url);
          }
        }
      } catch {
        // Silently handle error
      }
    };

    fetchCompanyLogo();
  }, [session]);

  return (
    <div className="flex w-64 flex-col border-r border-gray-200 bg-white dark:border-neutral-800 dark:bg-black">
      <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-6 dark:border-neutral-800">
        <Link href="/" className="flex items-center">
          {companyLogo ? (
            <div className="h-8 w-32 relative">
              <Image
                src={companyLogo}
                alt="Company Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          ) : (
            <h1 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand-start to-brand-end">InvGen</h1>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="px-3 py-4">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  pathname === item.href
                    ? "bg-gradient-to-r from-brand-start to-brand-end text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-neutral-900 dark:hover:text-gray-100",
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
                )}
              >
                <item.icon
                  className={classNames(
                    pathname === item.href
                      ? "text-white"
                      : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400",
                    "mr-3 h-5 w-5 shrink-0 transition-colors"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Support
            </h3>
            <div className="mt-2 space-y-1">
              {supportItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    pathname === item.href || pathname.startsWith(item.href + '/')
                      ? "bg-gradient-to-r from-brand-start to-brand-end text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-neutral-900 dark:hover:text-gray-100",
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
                  )}
                >
                  <item.icon
                    className={classNames(
                      pathname === item.href || pathname.startsWith(item.href + '/')
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400",
                      "mr-3 h-5 w-5 shrink-0 transition-colors"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
} 