-- Create tables for real-time collaboration
CREATE TABLE IF NOT EXISTS canvas_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  canvas_data JSONB DEFAULT '{}'::jsonb
);

-- Create table for real-time canvas updates
CREATE TABLE IF NOT EXISTS canvas_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES canvas_sessions(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  update_type VARCHAR(50) NOT NULL, -- 'add', 'update', 'delete', 'clear'
  element_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for user presence
CREATE TABLE IF NOT EXISTS user_presence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES canvas_sessions(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_color VARCHAR(7) NOT NULL,
  cursor_x FLOAT DEFAULT 0,
  cursor_y FLOAT DEFAULT 0,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE canvas_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can make these more restrictive)
CREATE POLICY "Allow all operations on canvas_sessions" ON canvas_sessions FOR ALL USING (true);
CREATE POLICY "Allow all operations on canvas_updates" ON canvas_updates FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_presence" ON user_presence FOR ALL USING (true);

-- Enable realtime for the tables
ALTER PUBLICATION supabase_realtime ADD TABLE canvas_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
