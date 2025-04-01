/*
  Warnings:

  - You are about to drop the column `createdBy` on the `PhoneModelDetails` table. All the data in the column will be lost.
  - Added the required column `adminId` to the `PhoneModelDetails` table without a default value. This is not possible if the table is not empty.
  - Made the column `colorId` on table `PhoneModelDetails` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sellerId` on table `PhoneModelDetails` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `PhoneModelDetails` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `PhoneModelDetails` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "PhoneModelDetails" DROP CONSTRAINT "PhoneModelDetails_colorId_fkey";

-- DropForeignKey
ALTER TABLE "PhoneModelDetails" DROP CONSTRAINT "PhoneModelDetails_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "PhoneModelDetails" DROP CONSTRAINT "PhoneModelDetails_sellerId_fkey";

-- DropIndex
DROP INDEX "PhoneModelDetails_createdBy_idx";

-- AlterTable
ALTER TABLE "PhoneModelDetails" DROP COLUMN "createdBy",
ADD COLUMN     "adminId" TEXT NOT NULL,
ALTER COLUMN "colorId" SET NOT NULL,
ALTER COLUMN "sellerId" SET NOT NULL,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- CreateIndex
CREATE INDEX "PhoneModelDetails_adminId_idx" ON "PhoneModelDetails"("adminId");

-- AddForeignKey
ALTER TABLE "PhoneModelDetails" ADD CONSTRAINT "PhoneModelDetails_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneModelDetails" ADD CONSTRAINT "PhoneModelDetails_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneModelDetails" ADD CONSTRAINT "PhoneModelDetails_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
