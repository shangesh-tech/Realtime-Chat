"use client"

import { useEffect, useState } from "react"
import { LoginScreen } from "@/components/auth/login-screen"
import { SignupScreen } from "@/components/auth/signup-screen"
import { MainChatLayout } from "@/components/chat/main-chat-layout"
import useAuthStore from "@/zustand/useAuthStore"

export default function Home() {
  const { authUser, checkAuth } = useAuthStore()
  const [currentScreen, setCurrentScreen] = useState("loading")

  useEffect(() => {
    (async () => {
      await checkAuth()
    })()
  }, [checkAuth])

  useEffect(() => {
    if (authUser) {
      setCurrentScreen("chat")
    } else if (currentScreen === "loading") {
      setCurrentScreen("login")
    }
  }, [authUser, currentScreen])

  // After Login
  const handleLogin = () => {
    setCurrentScreen("chat")
  }

  // After Signup
  const handleSignup = () => {
    setCurrentScreen("chat")
  }

  if (currentScreen === "loading") {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-lg text-gray-500">
        Loading...
      </div>
    )
  }

  if (currentScreen === "login") {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onSwitchToSignup={() => setCurrentScreen("signup")}
      />
    )
  }

  if (currentScreen === "signup") {
    return (
      <SignupScreen
        onSignup={handleSignup}
        onSwitchToLogin={() => setCurrentScreen("login")}
      />
    )
  }

  return <MainChatLayout user={authUser} />
}
