-- Make actor_id nullable in audit_logs table
-- This allows audit logs to be created even if the user doesn't exist in the users table

ALTER TABLE audit_logs
DROP CONSTRAINT audit_logs_actor_id_fkey;

ALTER TABLE audit_logs
ALTER COLUMN actor_id DROP NOT NULL;

ALTER TABLE audit_logs
ADD CONSTRAINT audit_logs_actor_id_fkey
  FOREIGN KEY (actor_id) REFERENCES users(id)
  ON DELETE SET NULL;
