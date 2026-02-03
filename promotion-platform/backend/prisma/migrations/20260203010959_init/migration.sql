/*
  Warnings:

  - The primary key for the `configurations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `configurations` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `price_history` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `price_history` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `promotionId` on the `price_history` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `promotions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `promotions` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `scraping_targets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `scraping_targets` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `sent_messages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `sent_messages` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `promotionId` on the `sent_messages` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `users` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_configurations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "category" TEXT NOT NULL DEFAULT 'general',
    "encrypted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_configurations" ("category", "createdAt", "encrypted", "id", "key", "type", "updatedAt", "value") SELECT "category", "createdAt", "encrypted", "id", "key", "type", "updatedAt", "value" FROM "configurations";
DROP TABLE "configurations";
ALTER TABLE "new_configurations" RENAME TO "configurations";
CREATE UNIQUE INDEX "configurations_key_key" ON "configurations"("key");
CREATE TABLE "new_price_history" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "promotionId" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "price_history_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_price_history" ("checkedAt", "id", "price", "promotionId") SELECT "checkedAt", "id", "price", "promotionId" FROM "price_history";
DROP TABLE "price_history";
ALTER TABLE "new_price_history" RENAME TO "price_history";
CREATE TABLE "new_promotions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "originalPrice" REAL NOT NULL,
    "promoPrice" REAL NOT NULL,
    "discountPercent" REAL NOT NULL,
    "store" TEXT NOT NULL,
    "category" TEXT,
    "imageUrl" TEXT,
    "productUrl" TEXT NOT NULL,
    "affiliateUrl" TEXT,
    "relevanceScore" REAL NOT NULL DEFAULT 0,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "isApproved" BOOLEAN,
    "generatedText" TEXT,
    "source" TEXT NOT NULL,
    "sourceId" TEXT,
    "lastChecked" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_promotions" ("affiliateUrl", "category", "createdAt", "description", "discountPercent", "generatedText", "id", "imageUrl", "isApproved", "isValid", "lastChecked", "originalPrice", "productUrl", "promoPrice", "relevanceScore", "source", "sourceId", "store", "title", "updatedAt") SELECT "affiliateUrl", "category", "createdAt", "description", "discountPercent", "generatedText", "id", "imageUrl", "isApproved", "isValid", "lastChecked", "originalPrice", "productUrl", "promoPrice", "relevanceScore", "source", "sourceId", "store", "title", "updatedAt" FROM "promotions";
DROP TABLE "promotions";
ALTER TABLE "new_promotions" RENAME TO "promotions";
CREATE UNIQUE INDEX "promotions_source_sourceId_key" ON "promotions"("source", "sourceId");
CREATE TABLE "new_scraping_targets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "selectors" TEXT NOT NULL,
    "lastScrape" DATETIME,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_scraping_targets" ("baseUrl", "createdAt", "id", "isActive", "lastScrape", "name", "selectors", "totalItems", "updatedAt") SELECT "baseUrl", "createdAt", "id", "isActive", "lastScrape", "name", "selectors", "totalItems", "updatedAt" FROM "scraping_targets";
DROP TABLE "scraping_targets";
ALTER TABLE "new_scraping_targets" RENAME TO "scraping_targets";
CREATE TABLE "new_sent_messages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "promotionId" INTEGER NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'whatsapp',
    "recipient" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "sent_messages_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_sent_messages" ("clicked", "delivered", "id", "message", "platform", "promotionId", "recipient", "sentAt") SELECT "clicked", "delivered", "id", "message", "platform", "promotionId", "recipient", "sentAt" FROM "sent_messages";
DROP TABLE "sent_messages";
ALTER TABLE "new_sent_messages" RENAME TO "sent_messages";
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("createdAt", "email", "id", "name", "password", "role", "updatedAt") SELECT "createdAt", "email", "id", "name", "password", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
