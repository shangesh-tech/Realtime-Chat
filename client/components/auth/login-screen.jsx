"use client";

import { useState } from "react";
import { MessageCircle, Eye, EyeOff } from "lucide-react";

export function LoginScreen({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Get CSRF token
      const csrfRes = await fetch("https://realtime-chat-qa08.onrender.com/auth/csrf", {
        credentials: "include",
      });
      
      if (!csrfRes.ok) {
        const text = await csrfRes.text();
        throw new Error(`CSRF fetch failed: ${csrfRes.status} - ${text}`);
      }
      
      const csrfData = await csrfRes.json().catch(() => {
        throw new Error("Invalid CSRF response - not JSON");
      });
      const csrfToken = csrfData.csrfToken;

      if (!csrfToken) {
        throw new Error("No CSRF token received");
      }

      // Perform login
      const loginResponse = await fetch(
        "https://realtime-chat-qa08.onrender.com/auth/callback/credentials",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            csrfToken,
            email,
            password,
          }),
          credentials: "include",
        }
      );

      if (!loginResponse.ok) {
        const errorText = await loginResponse.text();
        let errorMessage = errorText;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || "Login failed";
        } catch {}
        throw new Error(errorMessage);
      }

      // Get session
      const sessionResponse = await fetch(
        "https://realtime-chat-qa08.onrender.com/auth/session",
        {
          credentials: "include",
        }
      );

      if (!sessionResponse.ok) {
        const text = await sessionResponse.text();
        throw new Error(`Session fetch failed: ${sessionResponse.status} - ${text}`);
      }

      const session = await sessionResponse.json().catch(() => {
        throw new Error("Invalid session response - not JSON");
      });

      if (!session?.user) {
        throw new Error("No user data in session");
      }

      // Call onLogin
      onLogin({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        avatar: "https://ui-avatars.com/api/?background=9370DB&color=fff&name=" + session.user.name,
        status: "online",
      });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg p-4">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-lg overflow-hidden">
        <div className="text-center pb-8 pt-6 px-6">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <MessageCircle className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-gray-600 text-lg">
            Sign in to continue your conversations
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 px-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-semibold text-gray-700 block"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-black h-12 px-4 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-200 w-full outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-gray-700 block"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-black h-12 px-4 pr-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-200 w-full outline-none"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-4 pt-6 px-6 pb-6">
            <button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
            <p className="text-sm text-center text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-blue-600 hover:text-purple-600 font-semibold hover:underline transition-colors duration-200"
              >
                Create Account
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
