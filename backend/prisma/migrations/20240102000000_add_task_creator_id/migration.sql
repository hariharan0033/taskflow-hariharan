-- AlterTable: add creator_id to Task (nullable, references User with SetNull on delete)
ALTER TABLE "Task" ADD COLUMN "creator_id" TEXT;

ALTER TABLE "Task" ADD CONSTRAINT "Task_creator_id_fkey"
  FOREIGN KEY ("creator_id") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
