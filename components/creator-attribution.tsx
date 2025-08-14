"use client"

import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CreatorAttribution() {
  return (
    <div className="fixed bottom-4 left-4 z-10">
      <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
        <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground hover:text-foreground h-8">
          <a
            href="https://github.com/HassanXTech"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            Created by Hassan
            <ExternalLink className="h-3 w-3" />
          </a>
        </Button>
      </div>
    </div>
  )
}
