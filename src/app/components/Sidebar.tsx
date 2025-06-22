"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  { name: "Settings", href: "#", icon: Cog6ToothIcon },
  { name: "Help Center", href: "#", icon: QuestionMarkCircleIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full w-64 bg-white shadow-lg fixed">
      <div className="flex items-center justify-center h-20 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-brand-blue">InvGen</h1>
      </div>
      <div className="flex-grow p-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main Menu</h2>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={classNames(
                pathname === item.href
                  ? "bg-blue-50 text-brand-blue"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md"
              )}
            >
              <item.icon
                className={classNames(
                  pathname === item.href ? "text-brand-blue" : "text-gray-400 group-hover:text-gray-500",
                  "mr-3 flex-shrink-0 h-6 w-6"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
        </nav>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-8 mb-2">Supports</h2>
        <nav className="space-y-1">
          {supportItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <item.icon className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
} 