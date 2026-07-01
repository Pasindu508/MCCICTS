-- Add optional cover photo URL for news articles and events
ALTER TABLE news ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS image_url TEXT;
