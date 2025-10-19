"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import Link from "next/link";
import { ChevronLeftIcon } from "@/icons";

type AuthMode = "signin" | "signup";

export default function AuthContainer() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentMode, setCurrentMode] = useState<AuthMode>("signin");
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const mode = pathname.includes("signup") ? "signup" : "signin";
    setCurrentMode(mode);
  }, [pathname]);

  const handleModeChange = (newMode: AuthMode) => {
    if (newMode !== currentMode && !isTransitioning) {
      setIsTransitioning(true);
      
      // Start transition
      setTimeout(() => {
        setCurrentMode(newMode);
        router.push(newMode === "signup" ? "/signup" : "/signin");
        
        // End transition
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }, 150);
    }
  };

  return (
    <div className="w-full">
      {/* Back button */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 transition-all duration-200 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:gap-3 group"
        >
          <ChevronLeftIcon className="transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Quay lại trang chủ</span>
        </Link>
      </div>

      {/* Main content */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8 relative overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-purple-500/5 rounded-2xl"></div>
        
        {/* Content with transition */}
        <div className="relative z-10">
          <div className="relative overflow-hidden">
            <div className={`transition-all duration-300 ease-in-out ${
              isTransitioning 
                ? "opacity-0 transform scale-95" 
                : "opacity-100 transform scale-100"
            }`}>
              {currentMode === "signin" ? <SignInForm /> : <SignUpForm />}
            </div>
          </div>
        </div>

        {/* Mode toggle tabs */}
        <div className="absolute top-0 left-0 right-0 bg-gray-100/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-t-2xl p-1">
          <div className="flex">
            <button
              onClick={() => handleModeChange("signin")}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-xl transition-all duration-200 ${
                currentMode === "signin"
                  ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => handleModeChange("signup")}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-xl transition-all duration-200 ${
                currentMode === "signup"
                  ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
              }`}
            >
              Đăng ký
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
