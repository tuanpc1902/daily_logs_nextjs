"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

// Password strength indicator component
const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const getStrength = (password: string) => {
    if (!password) return 0;
    
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return Math.min(strength, 5);
  };

  const strength = getStrength(password);
  const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
  const strengthColor = [
    'bg-error-500',
    'bg-orange-500', 
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-success-500'
  ][strength];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-1 w-8 rounded-full transition-all duration-300 ${
                level <= strength ? strengthColor : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
        <span className={`text-xs ${
          strength <= 1 ? 'text-error-500' :
          strength <= 2 ? 'text-orange-500' :
          strength <= 3 ? 'text-yellow-500' :
          strength <= 4 ? 'text-blue-500' :
          'text-success-500'
        }`}>
          {strengthText}
        </span>
      </div>
    </div>
  );
};

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Email validation
  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return undefined;
  };

  // Password validation
  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return undefined;
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Show password strength when user starts typing password
    if (field === 'password' && value.length > 0) {
      setShowPasswordStrength(true);
    } else if (field === 'password' && value.length === 0) {
      setShowPasswordStrength(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, nextField?: 'password' | 'submit') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextField === 'password' && passwordInputRef.current) {
        passwordInputRef.current.focus();
      } else if (nextField === 'submit') {
        handleSubmit(e as any);
      }
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful login
      setIsSuccess(true);
      setAttempts(0);
      // Here you would typically call your authentication API
      console.log("Login attempt:", formData);
      
    } catch (error) {
      setAttempts(prev => prev + 1);
      setErrors({
        general: attempts >= 2 
          ? "Too many failed attempts. Please try again later." 
          : "Login failed. Please check your credentials and try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-focus email input on mount
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  return (
    <div className="pt-16">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl mb-4 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Đăng nhập
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Chào mừng bạn quay trở lại! Hãy đăng nhập để tiếp tục.
        </p>
      </div>
          
          {/* Success Message */}
          {isSuccess && (
            <div className="mb-4 p-4 bg-success-50 border border-success-200 rounded-lg dark:bg-success-900/20 dark:border-success-800 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-success-700 dark:text-success-300">
                  Login successful! Redirecting...
                </p>
              </div>
            </div>
          )}

          {/* General Error Message */}
          {errors.general && (
            <div className="mb-4 p-4 bg-error-50 border border-error-200 rounded-lg dark:bg-error-900/20 dark:border-error-800 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-error-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm text-error-700 dark:text-error-300">
                  {errors.general}
                </p>
              </div>
            </div>
          )}

        {/* Social Login Buttons */}
        <div className="space-y-4">
          {/* Divider */}
          <div className="relative py-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm"></div>
          </div>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <div className="relative">
              <Input 
                ref={emailInputRef}
                id="email-input"
                name="email"
                placeholder=" " 
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'password')}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                error={!!errors.email}
                hint={errors.email}
                className="peer pt-6 pb-2 px-4 w-full text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-brand-400"
              />
              <Label className={`absolute left-4 text-base font-normal text-gray-500 transition-all duration-200 dark:text-gray-400 ${
                formData.email || focusedField === 'email'
                  ? '-top-4 dark:bg-brand-50 p-1 text-sm text-brand-500 font-medium dark:text-brand-400'
                  : 'top-3'
              }`}>
                Email <span className="text-error-500">*</span>
              </Label>
            </div>
            {errors.email && (
              <p className="text-sm text-error-500 animate-in slide-in-from-top-1 duration-200">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="relative">
              <Input
                ref={passwordInputRef}
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder=" "
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'submit')}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                error={!!errors.password}
                hint={errors.password}
                className="peer pt-6 pb-2 px-4 pr-12 w-full text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-brand-400"
              />
              <Label className={`absolute left-4 text-base font-normal text-gray-500 transition-all duration-200 dark:text-gray-400 ${
                formData.password || focusedField === 'password'
                  ? 'top-0 text-sm text-brand-500 font-medium dark:text-brand-400'
                  : 'top-3'
              }`}>
                Mật khẩu <span className="text-error-500">*</span>
              </Label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 group"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? (
                  <EyeIcon className="w-5 h-5 fill-gray-500 dark:fill-gray-400 group-hover:fill-gray-700 dark:group-hover:fill-gray-300 transition-colors" />
                ) : (
                  <EyeCloseIcon className="w-5 h-5 fill-gray-500 dark:fill-gray-400 group-hover:fill-gray-700 dark:group-hover:fill-gray-300 transition-colors" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-error-500 animate-in slide-in-from-top-1 duration-200">
                {errors.password}
              </p>
            )}
            {showPasswordStrength && (
              <PasswordStrengthIndicator password={formData.password} />
            )}
          </div>
          {/* Remember me & Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={isChecked} 
                onChange={setIsChecked}
                className="w-5 h-5"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ghi nhớ đăng nhập
              </span>
            </div>
            <Link
              href="/reset-password"
              className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 transition-colors duration-200 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit Button */}
          <div>
            <Button 
              className="w-full py-3.5 px-6 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl hover:from-brand-600 hover:to-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] shadow-lg hover:shadow-xl" 
              size="sm"
              disabled={isLoading}
              startIcon={isLoading && (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Chưa có tài khoản?{" "}
            <Link
              href="/signup"
              className="font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400 transition-colors duration-200 hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
    </div>
  );
}
