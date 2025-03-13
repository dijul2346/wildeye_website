"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { collection, getDocs, updateDoc, doc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { CheckCircle, AlertTriangle, LogOut, User, ShieldAlert, MapPin, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import type { Detection, SystemSettings, ViewMode } from "../types"
import { DetectionCard } from "../components/detection-card"
import { ViewToggle } from "../components/view-toggle"

export default function AuthoritiesPage() {
  const [detections, setDetections] = useState<Detection[]>([])
  const [settings, setSettings] = useState<SystemSettings>({
    authoritiesCanVerify: true,
    authoritiesCanAlert: true,
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated and has authorities role
    const userRole = localStorage.getItem("userRole")
    if (!userRole) {
      router.push("/login")
      return
    }

    if (userRole !== "authorities" && userRole !== "admin") {
      router.push("/user")
      return
    }

    fetchDetections()
    fetchSettings()
  }, [router])

  const fetchSettings = async () => {
    try {
      const settingsRef = collection(db, "settings")
      const querySnapshot = await getDocs(settingsRef)

      if (!querySnapshot.empty) {
        const settingsData = querySnapshot.docs[0].data() as SystemSettings
        setSettings(settingsData)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  const fetchDetections = async () => {
    setLoading(true)
    try {
      const detectionsRef = collection(db, "detections")
      const querySnapshot = await getDocs(detectionsRef)
      const detectionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Detection[]
      setDetections(detectionsData)
    } catch (error) {
      console.error("Error fetching detections:", error)
      setError("Failed to fetch detections")
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (id: string) => {
    if (!settings.authoritiesCanVerify) {
      setError("Verification permission has been disabled by admin")
      setTimeout(() => setError(""), 3000)
      return
    }

    try {
      const detectionRef = doc(db, "detections", id)
      await updateDoc(detectionRef, { verified: true })
      fetchDetections()
    } catch (error) {
      console.error("Error marking detection as verified:", error)
      setError("Failed to mark detection as verified")
    }
  }

  const handleAlert = async (id: string) => {
    if (!settings.authoritiesCanAlert) {
      setError("Alert permission has been disabled by admin")
      setTimeout(() => setError(""), 3000)
      return
    }

    try {
      const detectionRef = doc(db, "detections", id)
      await updateDoc(detectionRef, { adminReply: true })
      fetchDetections()
    } catch (error) {
      console.error("Error marking detection as sent:", error)
      setError("Failed to mark detection as sent")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    router.push("/login")
  }

  const navigateToUserView = () => {
    router.push("/user")
  }

  const navigateToAdminView = () => {
    const userRole = localStorage.getItem("userRole")
    if (userRole === "admin") {
      router.push("/admin")
    } else {
      setError("You do not have permission to access the admin view")
      setTimeout(() => setError(""), 3000)
    }
  }

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode)
  }

  // Dummy function for delete since authorities can't delete
  const handleDelete = () => {}

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Authorities Dashboard</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={navigateToUserView} className="flex items-center">
              <User className="w-4 h-4 mr-2" /> User View
            </Button>
            <Button variant="outline" onClick={navigateToAdminView} className="flex items-center">
              <ShieldAlert className="w-4 h-4 mr-2" /> Admin View
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

          {!settings.authoritiesCanVerify || !settings.authoritiesCanAlert ? (
            <Alert className="mb-4 bg-amber-50 border-amber-200">
              <AlertDescription>
                {!settings.authoritiesCanVerify && !settings.authoritiesCanAlert
                  ? "Admin has disabled both verification and alert permissions for authorities."
                  : !settings.authoritiesCanVerify
                    ? "Admin has disabled verification permissions for authorities."
                    : "Admin has disabled alert permissions for authorities."}
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="mb-4 flex justify-end">
            <ViewToggle viewMode={viewMode} onViewChange={handleViewChange} />
          </div>

          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : viewMode === "list" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Video</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No detections found
                    </TableCell>
                  </TableRow>
                ) : (
                  detections.map((detection) => (
                    <TableRow
                      key={detection.id}
                      className={detection.verified ? "bg-green-100" : detection.adminReply ? "bg-red-100" : ""}
                    >
                      <TableCell>{detection.timestamp}</TableCell>
                      <TableCell>{detection.label}</TableCell>
                      <TableCell>
                        {detection.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{detection.location}</span>
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
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {detection.adminReply ? (
                          <Badge variant="destructive">Alert Sent</Badge>
                        ) : detection.verified ? (
                          <Badge variant="success" className="bg-green-500">
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <a
                          href={detection.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          View Image
                        </a>
                      </TableCell>
                      <TableCell>
                        <a
                          href={detection.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          View Video
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-500 text-white hover:bg-green-600"
                            onClick={() => handleVerify(detection.id)}
                            disabled={detection.verified || detection.adminReply || !settings.authoritiesCanVerify}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Verify
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-500 text-white hover:bg-red-600"
                            onClick={() => handleAlert(detection.id)}
                            disabled={!detection.verified || detection.adminReply || !settings.authoritiesCanAlert}
                          >
                            <AlertTriangle className="w-4 h-4 mr-1" /> Alert
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {detections.length === 0 ? (
                <div className="col-span-3 text-center py-8">
                  <p className="text-muted-foreground">No detections found</p>
                </div>
              ) : (
                detections.map((detection) => (
                  <DetectionCard
                    key={detection.id}
                    detection={detection}
                    isAdmin={false}
                    isAuthorities={true}
                    authoritiesCanVerify={settings.authoritiesCanVerify}
                    authoritiesCanAlert={settings.authoritiesCanAlert}
                    onVerify={handleVerify}
                    onAlert={handleAlert}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

