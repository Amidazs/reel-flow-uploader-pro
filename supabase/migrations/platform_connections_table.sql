
-- Create the platform_connections table
CREATE TABLE IF NOT EXISTS public.platform_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_id TEXT NOT NULL,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform_id)
);

-- Enable Row Level Security
ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own connections
CREATE POLICY "Users can read their own platform connections"
  ON public.platform_connections
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own connections
CREATE POLICY "Users can insert their own platform connections"
  ON public.platform_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own connections
CREATE POLICY "Users can update their own platform connections"
  ON public.platform_connections
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own connections
CREATE POLICY "Users can delete their own platform connections"
  ON public.platform_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_platform_connections_updated_at
BEFORE UPDATE ON public.platform_connections
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Comment on table and columns
COMMENT ON TABLE public.platform_connections IS 'Stores user connections to various platforms like Google, Facebook, etc.';
COMMENT ON COLUMN public.platform_connections.user_id IS 'References the user who owns this connection';
COMMENT ON COLUMN public.platform_connections.platform_id IS 'Identifier for the platform (google, facebook, etc.)';
COMMENT ON COLUMN public.platform_connections.access_token IS 'OAuth access token for the platform';
COMMENT ON COLUMN public.platform_connections.refresh_token IS 'OAuth refresh token if applicable';
COMMENT ON COLUMN public.platform_connections.expires_at IS 'When the access token expires';
COMMENT ON COLUMN public.platform_connections.metadata IS 'Additional platform-specific data';
