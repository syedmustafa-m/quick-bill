"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import ProfileDropdown from "./ProfileDropdown";
import { MagnifyingGlassIcon, BellIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";

function Header() {
    const { data: session } = useSession();

    return (
        <header className="bg-white border-b border-gray-200 p-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-semibold text-gray-800">Good Morning, {session?.user?.name}!</h1>
                    <p className="text-sm text-gray-500">Here is your overview for this month.</p>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="relative">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
                        <input type="text" placeholder="Search time, days..." className="pl-10 pr-4 py-2 w-64 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent" />
                    </div>
                    <BellIcon className="h-6 w-6 text-gray-500" />
                    {session?.user && <ProfileDropdown />}
                </div>
            </div>
        </header>
    )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = !['/auth/signin', '/auth/signup', '/auth/verified'].includes(pathname);

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">
      {showSidebar && <Sidebar />}
      <div className={showSidebar ? "flex-1 flex flex-col ml-64" : "flex-1 flex flex-col"}>
        {showSidebar && <Header />}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
} 