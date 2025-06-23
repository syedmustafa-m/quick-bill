"use client";

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgb(17 24 39)', // gray-900
          color: 'rgb(243 244 246)', // gray-100
          border: '1px solid rgb(55 65 81)', // gray-700
        },
        success: {
          iconTheme: {
            primary: '#f97316', // brand-start (orange)
            secondary: 'white',
          },
          style: {
            background: 'rgb(17 24 39)', // gray-900
            color: 'rgb(243 244 246)', // gray-100
            border: '1px solid rgb(34 197 94)', // green-500
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444', // red-500
            secondary: 'white',
          },
          style: {
            background: 'rgb(17 24 39)', // gray-900
            color: 'rgb(243 244 246)', // gray-100
            border: '1px solid rgb(239 68 68)', // red-500
          },
        },
      }}
    />
  );
} 