import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Only create client if we have valid credentials
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      })
    : null

export type Database = {
  public: {
    Tables: {
      canvas_sessions: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
          canvas_data: any
        }
        Insert: {
          id?: string
          name: string
          canvas_data?: any
        }
        Update: {
          name?: string
          canvas_data?: any
        }
      }
      canvas_updates: {
        Row: {
          id: string
          session_id: string
          user_id: string
          update_type: string
          element_data: any
          created_at: string
        }
        Insert: {
          session_id: string
          user_id: string
          update_type: string
          element_data: any
        }
      }
      user_presence: {
        Row: {
          id: string
          session_id: string
          user_id: string
          user_name: string
          user_color: string
          cursor_x: number
          cursor_y: number
          last_seen: string
        }
        Insert: {
          session_id: string
          user_id: string
          user_name: string
          user_color: string
          cursor_x?: number
          cursor_y?: number
        }
        Update: {
          cursor_x?: number
          cursor_y?: number
          last_seen?: string
        }
      }
    }
  }
}
