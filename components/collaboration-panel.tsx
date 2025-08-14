"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Share2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useCanvasStore } from "@/lib/store"

interface CollaborationSession {
  id: string
  name: string
  created_at: string
}

interface UserPresence {
  user_id: string
  user_name: string
  user_color: string
  cursor_x: number
  cursor_y: number
}

export function CollaborationPanel() {
  const [sessions, setSessions] = useState<CollaborationSession[]>([])
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null)
  const [connectedUsers, setConnectedUsers] = useState<UserPresence[]>([])
  const [newSessionName, setNewSessionName] = useState("")
  const [userName, setUserName] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const { setCollaborationMode, setSessionId, sessionId, collaborationMode } = useCanvasStore()

  const isSupabaseAvailable = supabase !== null

  // Generate random user color
  const generateUserColor = () => {
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  // Load existing sessions
  useEffect(() => {
    if (isSupabaseAvailable) {
      loadSessions()
    }
  }, [isSupabaseAvailable])

  const loadSessions = async () => {
    if (!supabase) return

    const { data, error } = await supabase
      .from("canvas_sessions")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(10)

    if (data && !error) {
      setSessions(data)
    }
  }

  // Create new collaboration session
  const createSession = async () => {
    if (!supabase || !newSessionName.trim() || !userName.trim()) return

    const { data, error } = await supabase
      .from("canvas_sessions")
      .insert([{ name: newSessionName.trim() }])
      .select()
      .single()

    if (data && !error) {
      await joinSession(data.id, data.name)
      setNewSessionName("")
      setIsDialogOpen(false)
      loadSessions()
    }
  }

  // Join existing session
  const joinSession = async (sessionId: string, sessionName: string) => {
    if (!supabase || !userName.trim()) {
      alert("Please enter your name first")
      return
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const userColor = generateUserColor()

    // Set collaboration mode
    setCollaborationMode(true)
    setSessionId(sessionId)
    setCurrentSession({ id: sessionId, name: sessionName, created_at: "" })
    setIsConnected(true)

    // Add user to presence table
    await supabase.from("user_presence").upsert({
      session_id: sessionId,
      user_id: userId,
      user_name: userName,
      user_color: userColor,
    })

    // Subscribe to canvas updates
    const updatesChannel = supabase
      .channel(`canvas_updates_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "canvas_updates",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          // Handle real-time canvas updates
          console.log("Canvas update received:", payload)
          // You would integrate this with your canvas store here
        },
      )
      .subscribe()

    // Subscribe to user presence
    const presenceChannel = supabase
      .channel(`user_presence_${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_presence",
          filter: `session_id=eq.${sessionId}`,
        },
        async () => {
          // Reload connected users
          const { data } = await supabase
            .from("user_presence")
            .select("*")
            .eq("session_id", sessionId)
            .gte("last_seen", new Date(Date.now() - 30000).toISOString()) // Active in last 30 seconds

          if (data) {
            setConnectedUsers(data)
          }
        },
      )
      .subscribe()

    // Store channels for cleanup
    ;(window as any).collaborationChannels = [updatesChannel, presenceChannel]
  }

  // Leave session
  const leaveSession = async () => {
    if (!supabase || !currentSession) return

    // Remove from presence
    await supabase.from("user_presence").delete().eq("session_id", currentSession.id)

    // Unsubscribe from channels
    const channels = (window as any).collaborationChannels || []
    channels.forEach((channel: any) => channel.unsubscribe())

    setCollaborationMode(false)
    setSessionId(null)
    setCurrentSession(null)
    setConnectedUsers([])
    setIsConnected(false)
  }

  // Copy session link
  const copySessionLink = () => {
    if (currentSession) {
      const link = `${window.location.origin}?session=${currentSession.id}`
      navigator.clipboard.writeText(link)
      alert("Session link copied to clipboard!")
    }
  }

  if (!isSupabaseAvailable) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Button variant="outline" size="sm" disabled>
          <Users className="h-4 w-4 mr-2" />
          Collaborate (Setup Required)
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {!isConnected ? (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Collaborate
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Join Collaboration</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Your Name</label>
                <Input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Enter your name" />
              </div>

              <div>
                <label className="text-sm font-medium">Create New Session</label>
                <div className="flex gap-2">
                  <Input
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="Session name"
                  />
                  <Button onClick={createSession} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Join Existing Session</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{session.name}</span>
                      <Button onClick={() => joinSession(session.id, session.name)} size="sm" variant="outline">
                        Join
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">{currentSession?.name}</span>
            </div>
            <div className="flex gap-1">
              <Button onClick={copySessionLink} size="sm" variant="ghost">
                <Share2 className="h-3 w-3" />
              </Button>
              <Button onClick={leaveSession} size="sm" variant="ghost">
                Leave
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {connectedUsers.map((user) => (
              <Badge
                key={user.user_id}
                variant="secondary"
                className="text-xs"
                style={{ backgroundColor: user.user_color + "20", color: user.user_color }}
              >
                {user.user_name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
