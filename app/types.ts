// Shared types across the application
export type Detection = {
  id: string
  timestamp: string
  label: string
  image_url: string
  video_url: string
  adminReply: boolean
  verified: boolean
  location?: string
  location_link?: string
}

export type SystemSettings = {
  id?: string
  authoritiesCanVerify: boolean
  authoritiesCanAlert: boolean
}

export type ViewMode = "list" | "card"

