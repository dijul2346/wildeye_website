import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertTriangle, Trash2, ExternalLink, MapPin } from "lucide-react"
import Image from "next/image"
import type { Detection } from "../types"

interface DetectionCardProps {
  detection: Detection
  isAdmin: boolean
  isAuthorities: boolean
  authoritiesCanVerify: boolean
  authoritiesCanAlert: boolean
  onVerify: (id: string) => void
  onAlert: (id: string) => void
  onDelete: (id: string) => void
}

export function DetectionCard({
  detection,
  isAdmin,
  isAuthorities,
  authoritiesCanVerify,
  authoritiesCanAlert,
  onVerify,
  onAlert,
  onDelete,
}: DetectionCardProps) {
  return (
    <Card className={detection.verified ? "border-green-500" : detection.sent ? "border-red-500" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{detection.label}</CardTitle>
          {detection.sent ? (
            <Badge variant="destructive">Alert Sent</Badge>
          ) : detection.verified ? (
            <Badge variant="success" className="bg-green-500">
              Verified
            </Badge>
          ) : (
            <Badge variant="outline">Pending</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{detection.timestamp}</p>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="relative w-full h-48 overflow-hidden rounded-md">
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
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" asChild>
            <a href={detection.image_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" /> Image
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={detection.video_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" /> Video
            </a>
          </Button>
        </div>

        {(isAdmin || isAuthorities) && (
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              className="bg-green-500 text-white hover:bg-green-600"
              onClick={() => onVerify(detection.id)}
              disabled={detection.verified || detection.sent || (isAuthorities && !authoritiesCanVerify)}
            >
              <CheckCircle className="w-4 h-4 mr-1" /> Verify
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={() => onAlert(detection.id)}
              disabled={!detection.verified || detection.sent || (isAuthorities && !authoritiesCanAlert)}
            >
              <AlertTriangle className="w-4 h-4 mr-1" /> Alert
            </Button>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-500 text-white hover:bg-blue-600"
                onClick={() => onDelete(detection.id)}
              >
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

