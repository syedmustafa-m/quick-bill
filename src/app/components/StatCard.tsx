"use client";

import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
}

export default function StatCard({ title, value, change, changeType, icon }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-white dark:bg-black p-5 shadow">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">{title}</dt>
            <dd>
              <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{value}</div>
            </dd>
          </dl>
        </div>
      </div>
      {change && (
        <div className="mt-2 text-sm">
          <p className={`flex items-baseline ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'increase' ? (
              <ArrowUpIcon className="h-5 w-5 flex-shrink-0 self-center text-green-500" />
            ) : (
              <ArrowDownIcon className="h-5 w-5 flex-shrink-0 self-center text-red-500" />
            )}
            <span className="sr-only">{changeType === 'increase' ? 'Increased' : 'Decreased'} by</span>
            <span className="ml-1">{change}</span>
          </p>
        </div>
      )}
    </div>
  );
} 