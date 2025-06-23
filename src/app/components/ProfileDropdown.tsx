"use client";

import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserCircleIcon } from "@heroicons/react/24/solid";
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
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg border border-gray-200 bg-white shadow-lg focus:outline-none dark:border-neutral-800 dark:bg-black">
          <div className="p-2">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {session.user.name}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {session.user.email}
              </p>
            </div>
            <div className="border-t border-gray-100 pt-2 dark:border-neutral-800">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/profile/edit"
                    className={`${
                      active
                        ? "bg-gray-50 text-gray-900 dark:bg-neutral-900 dark:text-gray-100"
                        : "text-gray-700 dark:text-gray-300"
                    } group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors`}
                  >
                    <UserCircleIcon className="mr-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    Edit Profile
                  </Link>
                )}
              </Menu.Item>
            </div>
            <div className="border-t border-gray-100 pt-2 dark:border-neutral-800">
              <Menu.Item>
                {({ active }) => (
                  <div
                    className={
                      active ? "rounded-md bg-gray-50 dark:bg-neutral-900" : ""
                    }
                  >
                    <SignOutButton />
                  </div>
                )}
              </Menu.Item>
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
} 