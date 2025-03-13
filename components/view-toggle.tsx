import { Button } from "@/components/ui/button"
import { List, Grid } from "lucide-react"
import type { ViewMode } from "../types"

interface ViewToggleProps {
  viewMode: ViewMode
  onViewChange: (mode: ViewMode) => void
}

export function ViewToggle({ viewMode, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={viewMode === "list" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewChange("list")}
        className="flex items-center"
      >
        <List className="h-4 w-4 mr-2" />
        List View
      </Button>
      <Button
        variant={viewMode === "card" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewChange("card")}
        className="flex items-center"
      >
        <Grid className="h-4 w-4 mr-2" />
        Card View
      </Button>
    </div>
  )
}

