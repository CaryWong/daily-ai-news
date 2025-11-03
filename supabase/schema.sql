-- Subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_is_active ON subscribers(is_active);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  pub_date TIMESTAMP WITH TIME ZONE,
  source TEXT,
  content TEXT,
  summary TEXT,
  guid TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on guid for faster deduplication
CREATE INDEX IF NOT EXISTS idx_articles_guid ON articles(guid);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);

-- Digest logs table (track sent digests)
CREATE TABLE IF NOT EXISTS digest_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  article_count INTEGER,
  subscriber_count INTEGER
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE digest_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your needs)
-- Allow public to insert subscribers (for signup)
CREATE POLICY "Allow public subscribe" ON subscribers
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow service role to do everything
CREATE POLICY "Allow service role all" ON subscribers
  FOR ALL TO service_role
  USING (true);

CREATE POLICY "Allow service role all articles" ON articles
  FOR ALL TO service_role
  USING (true);

CREATE POLICY "Allow service role all logs" ON digest_logs
  FOR ALL TO service_role
  USING (true);
