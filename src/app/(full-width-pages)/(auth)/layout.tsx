import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
      <ThemeProvider>
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-400/20 to-brand-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-brand-300/10 to-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Main content area - centered */}
        <div className="relative flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>

        {/* Theme toggle */}
        <div className="fixed top-6 right-6 z-50">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
