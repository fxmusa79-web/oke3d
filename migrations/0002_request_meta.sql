-- Extend custom_requests for product + custom flows and admin status
ALTER TABLE custom_requests ADD COLUMN type TEXT NOT NULL DEFAULT 'custom';
ALTER TABLE custom_requests ADD COLUMN product TEXT;
ALTER TABLE custom_requests ADD COLUMN status TEXT NOT NULL DEFAULT 'new';

CREATE INDEX IF NOT EXISTS idx_custom_requests_status
  ON custom_requests (status, created_at DESC);
