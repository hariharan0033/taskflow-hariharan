-- Reverse of 20240102000000_add_task_creator_id

ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_creator_id_fkey";
ALTER TABLE "Task" DROP COLUMN IF EXISTS "creator_id";
