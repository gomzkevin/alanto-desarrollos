-- Create desarrollos_borradores table for saving drafts during onboarding
CREATE TABLE IF NOT EXISTS desarrollos_borradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id INTEGER REFERENCES empresa_info(id),
  user_id UUID,
  
  -- Campos básicos del desarrollo
  nombre TEXT,
  ubicacion TEXT,
  total_unidades INTEGER,
  descripcion TEXT,
  amenidades JSONB,
  fecha_inicio DATE,
  fecha_entrega DATE,
  imagen_url TEXT,
  
  -- Metadata del wizard
  completed_steps JSONB DEFAULT '[]'::jsonb,
  last_modified TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_desarrollos_borradores_empresa ON desarrollos_borradores(empresa_id);
CREATE INDEX IF NOT EXISTS idx_desarrollos_borradores_user ON desarrollos_borradores(user_id);

-- RLS policies
ALTER TABLE desarrollos_borradores ENABLE ROW LEVEL SECURITY;

-- Users can insert their own drafts
CREATE POLICY "Users can insert their own drafts"
ON desarrollos_borradores
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own drafts
CREATE POLICY "Users can view their own drafts"
ON desarrollos_borradores
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own drafts
CREATE POLICY "Users can update their own drafts"
ON desarrollos_borradores
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own drafts
CREATE POLICY "Users can delete their own drafts"
ON desarrollos_borradores
FOR DELETE
USING (auth.uid() = user_id);

-- Function to clean up old drafts (older than 7 days)
CREATE OR REPLACE FUNCTION clean_old_desarrollos_borradores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM desarrollos_borradores
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$;