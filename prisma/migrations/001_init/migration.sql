-- CreateTable User
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT UNIQUE,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "googleId" TEXT UNIQUE,
    "googleEmail" TEXT,
    "gmailAccessToken" TEXT,
    "gmailRefreshToken" TEXT,
    "gmailExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable Account
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateTable Session
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- CreateTable Purchase
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL UNIQUE,
    "retailer" TEXT NOT NULL,
    "productTitle" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "orderDate" TIMESTAMP(3) NOT NULL,
    "productImage" TEXT,
    "emailId" TEXT UNIQUE,
    "emailSubject" TEXT,
    "emailFrom" TEXT,
    "emailBody" TEXT,
    "productUrl" TEXT,
    "orderId2" TEXT,
    "estimatedDelivery" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "warrantyExpiry" TIMESTAMP(3),
    "warrantyStatus" TEXT,
    "returnEligible" BOOLEAN NOT NULL DEFAULT false,
    "returnDeadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

CREATE INDEX "Purchase_userId_idx" ON "Purchase"("userId");
CREATE INDEX "Purchase_retailer_idx" ON "Purchase"("retailer");
CREATE INDEX "Purchase_orderDate_idx" ON "Purchase"("orderDate");

-- CreateTable ParsedEmail
CREATE TABLE "ParsedEmail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gmailMessageId" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sentDate" TIMESTAMP(3) NOT NULL,
    "retailer" TEXT,
    "orderId" TEXT,
    "productTitle" TEXT,
    "amount" DECIMAL(10,2),
    "currency" TEXT,
    "productImage" TEXT,
    "rawContent" TEXT,
    "parseError" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "purchased" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "ParsedEmail_userId_idx" ON "ParsedEmail"("userId");
CREATE INDEX "ParsedEmail_retailer_idx" ON "ParsedEmail"("retailer");
CREATE INDEX "ParsedEmail_processed_idx" ON "ParsedEmail"("processed");

-- CreateTable GmailSync
CREATE TABLE "GmailSync" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "lastSyncTime" TIMESTAMP(3),
    "lastHistoryId" TEXT,
    "syncStatus" TEXT NOT NULL DEFAULT 'idle',
    "lastError" TEXT,
    "totalEmails" INTEGER NOT NULL DEFAULT 0,
    "parsedEmails" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);
