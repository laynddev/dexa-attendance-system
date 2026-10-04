/*
  Warnings:

  - You are about to drop the column `employee_id` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `audit_logs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "employee_id",
DROP COLUMN "user_id",
ADD COLUMN     "actor_user_id" TEXT,
ADD COLUMN     "entity_id" TEXT,
ADD COLUMN     "entity_type" TEXT;
