"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login page by default
    router.push("/login")
  }, [router])

  return null // No UI needed as we're redirecting
}

