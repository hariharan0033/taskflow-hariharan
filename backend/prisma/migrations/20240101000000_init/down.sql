-- Drop in reverse dependency order

-- Drop foreign keys and tables
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_assignee_id_fkey";
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_project_id_fkey";
ALTER TABLE "Project" DROP CONSTRAINT IF EXISTS "Project_owner_id_fkey";

DROP TABLE IF EXISTS "Task";
DROP TABLE IF EXISTS "Project";
DROP TABLE IF EXISTS "User";

-- Drop enums
DROP TYPE IF EXISTS "TaskPriority";
DROP TYPE IF EXISTS "TaskStatus";
