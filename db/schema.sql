-- MCCICTS News & Events schema (Neon Postgres)

CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  author TEXT DEFAULT 'MCCICTS',
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  end_time TIME,
  category TEXT NOT NULL DEFAULT 'Workshop',
  organizer TEXT DEFAULT 'MCCICTS ICT Society',
  registration_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS news_public_read ON news;
CREATE POLICY news_public_read ON news FOR SELECT USING (true);

DROP POLICY IF EXISTS events_public_read ON events;
CREATE POLICY events_public_read ON events FOR SELECT USING (true);

GRANT SELECT ON news TO PUBLIC;
GRANT SELECT ON events TO PUBLIC;
