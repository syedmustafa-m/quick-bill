"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import ProfileDropdown from "./ProfileDropdown";
import ThemeToggle from "./ThemeToggle";
import { useSession } from "next-auth/react";

function Header() {
    const { data: session } = useSession();

    return (
        <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-neutral-800 dark:bg-black/80">
            <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Welcome back, {session?.user?.name}
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    {session?.user && <ProfileDropdown />}
                </div>
            </div>
        </header>
    )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const showSidebar = !pathname.startsWith('/auth/');

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-black">
            {showSidebar && <Sidebar />}
            <div className={showSidebar ? "flex-1 flex flex-col min-w-0" : "flex-1 flex flex-col"}>
                {showSidebar && <Header />}
                <main className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
} 