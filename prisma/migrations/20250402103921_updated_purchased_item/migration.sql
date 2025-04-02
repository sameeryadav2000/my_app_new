/*
  Warnings:

  - You are about to drop the column `itemId` on the `PurchasedItem` table. All the data in the column will be lost.
  - Added the required column `phoneModelDetailsId` to the `PurchasedItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurchasedItem" DROP COLUMN "itemId",
ADD COLUMN     "phoneModelDetailsId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "PurchasedItem_phoneModelDetailsId_idx" ON "PurchasedItem"("phoneModelDetailsId");

-- AddForeignKey
ALTER TABLE "PurchasedItem" ADD CONSTRAINT "PurchasedItem_phoneModelDetailsId_fkey" FOREIGN KEY ("phoneModelDetailsId") REFERENCES "PhoneModelDetails"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
