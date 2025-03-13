"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { db } from  "@/lib/firebase" // Ensure you export `db` from your firebase.ts file

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const userRole = localStorage.getItem("userRole")
    if (userRole === "admin") {
      router.push("/admin")
    } else if (userRole === "authorities") {
      router.push("/authorities")
    } else if (userRole === "user") {
      router.push("/user")
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Authenticate user with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Check which collection the user belongs to
      const adminDoc = await getDoc(doc(db, "admin", user.uid))
      const userDoc = await getDoc(doc(db, "user", user.uid))
      const authoritiesDoc = await getDoc(doc(db, "authorities", user.uid))

      if (adminDoc.exists()) {
        // User is an admin
        localStorage.setItem("userRole", "admin")
        router.push("/admin")
      } else if (authoritiesDoc.exists()) {
        // User is an authority
        localStorage.setItem("userRole", "authorities")
        router.push("/authorities")
      } else if (userDoc.exists()) {
        // User is a regular user
        localStorage.setItem("userRole", "user")
        router.push("/user")
      } else {
        // User not found in any collection
        setError("User role not found")
      }
    } catch (error) {
      setError("Invalid email or password")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm">
            Don't have an account?{" "}
            <a href="#" className="text-blue-500">
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}