-- CreateEnum
CREATE TYPE "ResetTokenType" AS ENUM ('OTP', 'RESET');

-- DropIndex
DROP INDEX "password_reset_tokens_user_id_idx";

-- AlterTable
ALTER TABLE "password_reset_tokens" ADD COLUMN     "type" "ResetTokenType" NOT NULL DEFAULT 'OTP';

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_type_idx" ON "password_reset_tokens"("user_id", "type");
