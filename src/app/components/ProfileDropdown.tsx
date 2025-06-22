"use client";

import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ChevronDownIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import SignOutButton from "./SignOutButton";

export default function ProfileDropdown() {
  const { data: session } = useSession();

  if (!session || !session.user) {
    return null;
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2">
          <span className="sr-only">Open user menu</span>
          <Image
            src={session.user.image || `https://ui-avatars.com/api/?name=${session.user.name}&background=335fb3&color=fff`}
            width={40}
            height={40}
            alt="User avatar"
            className="rounded-full"
          />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-1">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm text-gray-900">Signed in as</p>
              <p className="truncate text-sm font-medium text-gray-600">
                {session.user.email}
              </p>
            </div>
            <div className="py-1">
                <Menu.Item>
                    <Link href="/profile/edit" className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-100 hover:text-brand-blue rounded-md">
                        <UserCircleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-brand-blue" />
                        Edit Profile
                    </Link>
                </Menu.Item>
            </div>
            <div className="py-1 border-t border-gray-100">
                <Menu.Item>
                    <SignOutButton />
                </Menu.Item>
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
} 