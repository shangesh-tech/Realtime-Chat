"use client"

import { useState } from "react"
import { LoginScreen } from "@/components/auth/login-screen"
import { SignupScreen } from "@/components/auth/signup-screen"
import { MainChatLayout } from "@/components/chat/main-chat-layout"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState("login")
  const [user, setUser] = useState(null)

  const handleLogin = (userData) => {    
    setUser(userData)
    setCurrentScreen("chat")
  }

  const handleSignup = (userData) => {
    setUser(userData)
    setCurrentScreen("chat")
  }

  if (currentScreen === "login") {
    return <LoginScreen onLogin={handleLogin} onSwitchToSignup={() => setCurrentScreen("signup")} />
  }

  if (currentScreen === "signup") {
    return <SignupScreen onSignup={handleSignup} onSwitchToLogin={() => setCurrentScreen("login")} />
  }

  return <MainChatLayout user={user} />
}
