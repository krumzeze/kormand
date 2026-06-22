-- Telegram/phone contact verification (ADR 0008)
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phoneVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "telegramId" TEXT,
ADD COLUMN     "telegramUsername" TEXT,
ADD COLUMN     "telegramChatId" TEXT,
ADD COLUMN     "telegramVerifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "telegram_link_tokens" (
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "telegram_link_tokens_pkey" PRIMARY KEY ("token")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_telegramId_key" ON "users"("telegramId");

-- CreateIndex
CREATE INDEX "telegram_link_tokens_userId_idx" ON "telegram_link_tokens"("userId");

-- AddForeignKey
ALTER TABLE "telegram_link_tokens" ADD CONSTRAINT "telegram_link_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
