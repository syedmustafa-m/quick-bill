"use client";

import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserCircleIcon, PencilIcon } from "@heroicons/react/24/outline";
import SignOutButton from "./SignOutButton";

export default function ProfileDropdown() {
  const { data: session } = useSession();

  if (!session || !session.user) {
    return null;
  }

  const userImage = session.user.image;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-start focus:ring-offset-2 dark:bg-black">
          <span className="sr-only">Open user menu</span>
          {userImage ? (
            <Image
              src={userImage}
              width={32}
              height={32}
              alt="User avatar"
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <UserCircleIcon className="h-8 w-8 text-gray-500" />
          )}
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-xl border border-gray-200 bg-white shadow-lg focus:outline-none dark:border-neutral-800 dark:bg-black">
          <div className="p-3 space-y-2">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-neutral-800 mb-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {session.user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {session.user.email}
              </p>
            </div>
            
            {/* Edit Profile Button */}
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/profile/edit"
                  className={`${
                    active
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300"
                  } group flex w-full items-center rounded-lg px-4 py-3 text-sm gap-3 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300`}
                >
                  <div className="flex items-center justify-center w-5 h-5">
                    <PencilIcon className="h-4 w-4 text-current" />
                  </div>
                  <span className="font-medium">Edit Profile</span>
                </Link>
              )}
            </Menu.Item>

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-neutral-800 my-2"></div>

            {/* Sign Out Button */}
            <Menu.Item>
              {({ active }) => (
                <div
                  className={
                    active ? "rounded-lg bg-gray-50 dark:bg-neutral-900" : ""
                  }
                >
                  <SignOutButton />
                </div>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
} 