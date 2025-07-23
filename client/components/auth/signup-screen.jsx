"use client"

import { useState } from "react"
import { MessageCircle, Eye, EyeOff, Check, X } from "lucide-react"

export function SignupScreen({ onSignup, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState("")

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    if (apiError) {
      setApiError("")
    }
  }

  const validateForm = () => {  
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    if (!formData.password) newErrors.password = "Password is required"
    if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"
    if (!/[A-Z]/.test(formData.password)) newErrors.password = "Password must contain an uppercase letter"
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) newErrors.password = "Password must contain a symbol"
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) return;
  
    setIsLoading(true);
    setApiError("");
  
    try {
      // 1. Registration
      const response = await fetch('https://realtime-chat-qa08.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
        credentials: 'include', // make sure to always send cookies!
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
  
      // 2. FETCH CSRF Token just before login
      const csrfRes = await fetch('https://realtime-chat-qa08.onrender.com/auth/csrf', {
        credentials: 'include',
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        cache: "no-store"
      });
      
      if (!csrfRes.ok) {
        console.error("CSRF fetch failed:", csrfRes.status);
        throw new Error("Authentication error");
      }
      
      let csrfData;
      try {
        csrfData = await csrfRes.json();
      } catch (e) {
        console.error("Invalid CSRF JSON:", e);
        throw new Error("Server returned invalid response");
      }
      
      const csrfToken = csrfData.csrfToken;
      
      if (!csrfToken) {
        console.error("No CSRF token in response");
        throw new Error("Authentication error: Missing security token");
      }
  
      // 3. Login (include CSRF!)
      const loginResponse = await fetch('https://realtime-chat-qa08.onrender.com/auth/callback/credentials', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: new URLSearchParams({
          csrfToken,        // <- Auth.js requires this!
          email: formData.email,
          password: formData.password,
          redirect: "false" // Important: prevent redirect
        }),
        credentials: 'include',
        cache: "no-store",
        redirect: "follow"
      });
  
      if (!loginResponse.ok) {
        // If login fails after registration, redirect to login
        onSwitchToLogin();
        return;
      }
  
      // 4. Get session data after successful login
      const sessionResponse = await fetch('https://realtime-chat-qa08.onrender.com/api/auth/session', {
        credentials: 'include',
        headers: {
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        cache: "no-store"
      });
  
      if (!sessionResponse.ok) {
        console.error("Session fetch failed:", sessionResponse.status);
        throw new Error('Authentication failed');
      }
  
      let session;
      try {
        session = await sessionResponse.json();
      } catch (e) {
        console.error("Error parsing session response:", e);
        throw new Error("Invalid response from server");
      }
  
      // Call the onSignup callback with user data
      onSignup({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.image || "/placeholder.svg?height=40&width=40",
        status: "online",
      });
    } catch (err) {
      console.error('Registration error:', err);
      setApiError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  

  const hasMinLength = formData.password.length >= 8
  const hasUpperCase = /[A-Z]/.test(formData.password)
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  const passwordStrength = hasMinLength && hasUpperCase && hasSymbol
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== ""

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg p-4">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-xl overflow-hidden">
        <div className="text-center pb-6 px-6 pt-6">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <MessageCircle className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Account
          </h2>
          <p className="text-gray-600 text-lg">Join thousands of users worldwide</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6">
            {apiError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {apiError}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-gray-700 block">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={`text-black h-12 px-4 border-2 rounded-xl transition-all duration-200 w-full focus:outline-none ${
                  errors.name ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                }`}
                required
              />
              {errors.name && (
                <div className="flex items-center space-x-1 text-red-500 text-sm">
                  <X className="h-3 w-3" />
                  <span>{errors.name}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700 block">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={`text-black h-12 px-4 border-2 rounded-xl transition-all duration-200 w-full focus:outline-none ${
                  errors.email ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                }`}
                required
              />
              {errors.email && (
                <div className="flex items-center space-x-1 text-red-500 text-sm">
                  <X className="h-3 w-3" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700 block">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={`text-black h-12 px-4 pr-12 border-2 rounded-xl transition-all duration-200 w-full focus:outline-none ${
                    errors.password ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"
                  }`}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.password && (
                <div className="space-y-1 mt-1">
                  <div className={`flex items-center space-x-1 text-sm ${hasMinLength ? "text-green-500" : "text-red-500"}`}>
                    {hasMinLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center space-x-1 text-sm ${hasUpperCase ? "text-green-500" : "text-red-500"}`}>
                    {hasUpperCase ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    <span>Contains uppercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-1 text-sm ${hasSymbol ? "text-green-500" : "text-red-500"}`}>
                    {hasSymbol ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    <span>Contains symbol</span>
                  </div>
                </div>
              )}
              {errors.password && (
                <div className="flex items-center space-x-1 text-red-500 text-sm">
                  <X className="h-3 w-3" />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 block">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  className={`text-black h-12 px-4 pr-12 border-2 rounded-xl transition-all duration-200 w-full focus:outline-none ${
                    errors.confirmPassword
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-blue-500"
                  }`}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.confirmPassword && (
                <div className={`flex items-center space-x-1 text-sm ${passwordsMatch ? "text-green-500" : "text-red-500"}`}>
                  {passwordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  <span>{passwordsMatch ? "Passwords match" : "Passwords do not match"}</span>
                </div>
              )}
              {errors.confirmPassword && (
                <div className="flex items-center space-x-1 text-red-500 text-sm">
                  <X className="h-3 w-3" />
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col space-y-4 pt-4 px-6 pb-6 mt-4">
            <button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>
            <p className="text-sm text-center text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:text-purple-600 font-semibold hover:underline transition-colors duration-200"
              >
                Sign In
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
