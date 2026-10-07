-- D1 schema for custom design requests
-- Database: oke3d_requests (binding CUSTOM_REQUESTS)
-- Apply after: wrangler d1 create oke3d_requests
CREATE TABLE IF NOT EXISTS custom_requests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  description TEXT NOT NULL,
  image_key TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_custom_requests_created_at
  ON custom_requests (created_at DESC);
