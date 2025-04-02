/*
  Warnings:

  - You are about to drop the column `itemId` on the `CartItem` table. All the data in the column will be lost.
  - Added the required column `phoneModelDetailsId` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Made the column `sellerId` on table `CartItem` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_sellerId_fkey";

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "itemId",
ADD COLUMN     "phoneModelDetailsId" INTEGER NOT NULL,
ALTER COLUMN "sellerId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "CartItem_phoneModelDetailsId_idx" ON "CartItem"("phoneModelDetailsId");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_phoneModelDetailsId_fkey" FOREIGN KEY ("phoneModelDetailsId") REFERENCES "PhoneModelDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
