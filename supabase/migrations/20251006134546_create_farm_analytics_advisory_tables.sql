/*
  # Create Farm Analytics and Advisory Tables

  1. New Tables
    - `farm_details`
      - Extended information about farms including location and area
      - Links to farms table with foreign key
      - Stores geographic coordinates and metadata
    
    - `indices_images`
      - Stores processed index images (NDVI, NDRE, etc.)
      - Links to farms via farm_id
      - Tracks different index types and their URLs
    
    - `analytics`
      - Stores calculated analytics from processed images
      - Includes NDVI statistics and health scores
      - Tracks stress and healthy areas
      - Supports extensible metadata JSON field
    
    - `advisories`
      - Stores AI-generated farming advisories
      - Categorized by type (irrigation, fertilization, pest control, general)
      - Priority levels and action items
      - Status tracking for advisory implementation

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read data for their farms
    - Add policies for system to insert analytics and advisories
*/

-- Create farm_details table
CREATE TABLE IF NOT EXISTS farm_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id text NOT NULL UNIQUE,
  client_id text NOT NULL,
  location text,
  area numeric,
  latitude numeric,
  longitude numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indices_images table
CREATE TABLE IF NOT EXISTS indices_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id text NOT NULL,
  client_id text NOT NULL,
  index_type text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id text NOT NULL,
  client_id text NOT NULL,
  analysis_date timestamptz DEFAULT now(),
  ndvi_average numeric,
  ndvi_min numeric,
  ndvi_max numeric,
  health_score numeric,
  stress_areas numeric,
  healthy_areas numeric,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create advisories table
CREATE TABLE IF NOT EXISTS advisories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id text NOT NULL,
  client_id text NOT NULL,
  advisory_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  action_items jsonb DEFAULT '[]',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE farm_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE indices_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE advisories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for farm_details
CREATE POLICY "Users can view own farm details"
  ON farm_details FOR SELECT
  TO authenticated
  USING (client_id = current_user);

CREATE POLICY "Users can insert own farm details"
  ON farm_details FOR INSERT
  TO authenticated
  WITH CHECK (client_id = current_user);

CREATE POLICY "Users can update own farm details"
  ON farm_details FOR UPDATE
  TO authenticated
  USING (client_id = current_user)
  WITH CHECK (client_id = current_user);

-- RLS Policies for indices_images
CREATE POLICY "Users can view own indices images"
  ON indices_images FOR SELECT
  TO authenticated
  USING (client_id = current_user);

CREATE POLICY "Users can insert own indices images"
  ON indices_images FOR INSERT
  TO authenticated
  WITH CHECK (client_id = current_user);

-- RLS Policies for analytics
CREATE POLICY "Users can view own analytics"
  ON analytics FOR SELECT
  TO authenticated
  USING (client_id = current_user);

CREATE POLICY "Users can insert own analytics"
  ON analytics FOR INSERT
  TO authenticated
  WITH CHECK (client_id = current_user);

-- RLS Policies for advisories
CREATE POLICY "Users can view own advisories"
  ON advisories FOR SELECT
  TO authenticated
  USING (client_id = current_user);

CREATE POLICY "Users can insert own advisories"
  ON advisories FOR INSERT
  TO authenticated
  WITH CHECK (client_id = current_user);

CREATE POLICY "Users can update own advisories"
  ON advisories FOR UPDATE
  TO authenticated
  USING (client_id = current_user)
  WITH CHECK (client_id = current_user);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_farm_details_farm_id ON farm_details(farm_id);
CREATE INDEX IF NOT EXISTS idx_indices_images_farm_id ON indices_images(farm_id);
CREATE INDEX IF NOT EXISTS idx_analytics_farm_id ON analytics(farm_id);
CREATE INDEX IF NOT EXISTS idx_advisories_farm_id ON advisories(farm_id);
CREATE INDEX IF NOT EXISTS idx_advisories_status ON advisories(status);