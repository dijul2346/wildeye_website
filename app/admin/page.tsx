"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { collection, getDocs, updateDoc, doc, deleteDoc, setDoc } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { CheckCircle, AlertTriangle, Trash2, LogOut, User, Shield, MapPin, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { Detection, SystemSettings, ViewMode } from "../types"
import { DetectionCard } from "../components/detection-card"
import { ViewToggle } from "../components/view-toggle"

export default function AdminPage() {
  const [detections, setDetections] = useState<Detection[]>([])
  const [settings, setSettings] = useState<SystemSettings>({
    authoritiesCanVerify: true,
    authoritiesCanAlert: true,
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [settingsId, setSettingsId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated and has admin role
    const userRole = localStorage.getItem("userRole")
    if (!userRole) {
      router.push("/login")
      return
    }

    if (userRole !== "admin") {
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
        const settingsDoc = querySnapshot.docs[0]
        const settingsData = settingsDoc.data() as SystemSettings
        setSettings(settingsData)
        setSettingsId(settingsDoc.id)
      } else {
        // Create default settings if none exist
        const defaultSettings: SystemSettings = {
          authoritiesCanVerify: true,
          authoritiesCanAlert: true,
        }

        const newSettingsRef = doc(collection(db, "settings"))
        await setDoc(newSettingsRef, defaultSettings)
        setSettingsId(newSettingsRef.id)
        setSettings(defaultSettings)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      setError("Failed to fetch system settings")
    }
  }

  const updateSettings = async (newSettings: SystemSettings) => {
    try {
      if (settingsId) {
        const settingsRef = doc(db, "settings", settingsId)
        await updateDoc(settingsRef, newSettings)
        setSettings(newSettings)
      }
    } catch (error) {
      console.error("Error updating settings:", error)
      setError("Failed to update system settings")
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
    try {
      const detectionRef = doc(db, "detections", id)
      await updateDoc(detectionRef, { adminReply: true })
      fetchDetections()
    } catch (error) {
      console.error("Error marking detection as sent:", error)
      setError("Failed to mark detection as sent")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const detectionRef = doc(db, "detections", id)
      await deleteDoc(detectionRef)
      fetchDetections()
    } catch (error) {
      console.error("Error deleting detection:", error)
      setError("Failed to delete detection")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    router.push("/login")
  }

  const navigateToUserView = () => {
    router.push("/user")
  }

  const navigateToAuthoritiesView = () => {
    router.push("/authorities")
  }

  const toggleAuthoritiesVerify = () => {
    const newSettings = {
      ...settings,
      authoritiesCanVerify: !settings.authoritiesCanVerify,
    }
    updateSettings(newSettings)
  }

  const toggleAuthoritiesAlert = () => {
    const newSettings = {
      ...settings,
      authoritiesCanAlert: !settings.authoritiesCanAlert,
    }
    updateSettings(newSettings)
  }

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode)
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Authorities Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="verify-permission">Verification Permission</Label>
                <p className="text-sm text-muted-foreground">Allow authorities to verify detections</p>
              </div>
              <Switch
                id="verify-permission"
                checked={settings.authoritiesCanVerify}
                onCheckedChange={toggleAuthoritiesVerify}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="alert-permission">Alert Permission</Label>
                <p className="text-sm text-muted-foreground">Allow authorities to send alerts</p>
              </div>
              <Switch
                id="alert-permission"
                checked={settings.authoritiesCanAlert}
                onCheckedChange={toggleAuthoritiesAlert}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Admin Dashboard</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={navigateToUserView} className="flex items-center">
              <User className="w-4 h-4 mr-2" /> User View
            </Button>
            <Button variant="outline" onClick={navigateToAuthoritiesView} className="flex items-center">
              <Shield className="w-4 h-4 mr-2" /> Authorities View
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
                  <TableHead>Image</TableHead>
                  <TableHead>Video</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detections.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
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
                            disabled={detection.verified || detection.adminReply}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Verify
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-500 text-white hover:bg-red-600"
                            onClick={() => handleAlert(detection.id)}
                            disabled={!detection.verified || detection.adminReply}
                          >
                            <AlertTriangle className="w-4 h-4 mr-1" /> Alert
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-blue-500 text-white hover:bg-blue-600"
                            onClick={() => handleDelete(detection.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Delete
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
                    isAdmin={true}
                    isAuthorities={false}
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

