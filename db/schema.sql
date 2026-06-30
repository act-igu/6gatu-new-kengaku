-- 入居問い合わせ管理ツール データベーススキーマ（PostgreSQL / Neon）

CREATE TABLE IF NOT EXISTS staff (
  staff_id UUID PRIMARY KEY,
  login_id TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('editor', 'viewer')),
  active BOOLEAN NOT NULL DEFAULT true,
  default_site_tags TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  site_tags TEXT[] NOT NULL DEFAULT '{}',
  hold JSONB NOT NULL,
  follow_up JSONB NOT NULL,
  schedule JSONB NOT NULL,
  acceptance JSONB NOT NULL,
  pane3 JSONB NOT NULL,
  documents JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS memos (
  entry_id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  occurred_at TIMESTAMPTZ NOT NULL,
  contact_date DATE,
  author_staff_id UUID NOT NULL REFERENCES staff(staff_id),
  body TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_memos_candidate_id ON memos(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_updated_at ON candidates(updated_at DESC);
