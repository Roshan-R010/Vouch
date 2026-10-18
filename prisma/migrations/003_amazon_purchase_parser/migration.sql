-- Extend Purchase for parsed Amazon order details.
ALTER TABLE "Purchase"
  ALTER COLUMN "amount" DROP NOT NULL,
  ADD COLUMN "quantity" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "orderStatus" TEXT;

-- Scope retailer order IDs to each user instead of treating them as globally unique.
DROP INDEX IF EXISTS "Purchase_orderId_key";
CREATE UNIQUE INDEX "Purchase_userId_retailer_orderId_key"
  ON "Purchase"("userId", "retailer", "orderId");

-- Gmail message IDs are unique within a user's mailbox.
DROP INDEX IF EXISTS "ParsedEmail_gmailMessageId_key";
CREATE UNIQUE INDEX "ParsedEmail_userId_gmailMessageId_key"
  ON "ParsedEmail"("userId", "gmailMessageId");
