"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LogOut, ShieldAlert, ExternalLink, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import type { Detection } from "../types"

export default function UserPage() {
  const [detections, setDetections] = useState<Detection[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const userRole = localStorage.getItem("userRole")
    if (!userRole) {
      router.push("/login")
      return
    }

    fetchDetections()
  }, [router])

  const fetchDetections = async () => {
    setLoading(true)
    try {
      const detectionsRef = collection(db, "detections")
      const querySnapshot = await getDocs(detectionsRef)
      const detectionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Detection[]

      // Filter detections to show only verified or sent alerts
      const filteredDetections = detectionsData.filter((d) => d.verified || d.adminReply)
      setDetections(filteredDetections)
    } catch (error) {
      console.error("Error fetching detections:", error)
      setError("Failed to fetch detections")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    router.push("/login")
  }

  const navigateToAdminView = () => {
    const userRole = localStorage.getItem("userRole")
    if (userRole === "admin") {
      router.push("/admin")
    } else if (userRole === "authorities") {
      router.push("/authorities")
    } else {
      setError("You do not have permission to access the admin view")
      setTimeout(() => setError(""), 3000)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">User Dashboard</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={navigateToAdminView} className="flex items-center">
              <ShieldAlert className="w-4 h-4 mr-2" /> Admin/Authorities View
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="flex items-center">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : detections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No verified detections or alerts found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {detections.map((detection) => (
                <Card key={detection.id} className={detection.adminReply ? "border-red-500" : "border-green-500"}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{detection.label}</CardTitle>
                      {detection.adminReply ? (
                        <Badge variant="destructive">Alert Sent</Badge>
                      ) : (
                        <Badge variant="success" className="bg-green-500">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{detection.timestamp}</p>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="relative w-full h-48 mb-2 overflow-hidden rounded-md">
                      <Image
                        src={detection.image_url || "/placeholder.svg?height=200&width=400"}
                        alt={detection.label}
                        fill
                        style={{ objectFit: "cover" }}
                        className="transition-all hover:scale-105"
                      />
                    </div>

                    {detection.location && (
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {detection.location}
                          {detection.location_link && (
                            <a
                              href={detection.location_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-blue-500 hover:underline inline-flex items-center"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" /> Map
                            </a>
                          )}
                        </span>
                      </div>
                    )}

                    {detection.adminReply && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription>
                          This detection has been verified and an alert has been sent to authorities.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <a href={detection.image_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" /> View Image
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={detection.video_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" /> View Video
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

