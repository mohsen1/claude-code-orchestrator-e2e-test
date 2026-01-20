-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  is_archived INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Group members table
CREATE TABLE IF NOT EXISTS group_members (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
  joined_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  status TEXT NOT NULL DEFAULT 'accepted', -- 'pending', 'accepted', 'declined'
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(group_id, user_id)
);

-- Group invitations table
CREATE TABLE IF NOT EXISTS group_invitations (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL,
  invited_by TEXT NOT NULL,
  invitee_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'expired'
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  expires_at INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
  FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_status ON group_members(status);
CREATE INDEX IF NOT EXISTS idx_group_invitations_group_id ON group_invitations(group_id);
CREATE INDEX IF NOT EXISTS idx_group_invitations_token ON group_invitations(token);
CREATE INDEX IF NOT EXISTS idx_group_invitations_email ON group_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_groups_timestamp
AFTER UPDATE ON groups
BEGIN
  UPDATE groups SET updated_at = strftime('%s', 'now') WHERE id = NEW.id;
END;
