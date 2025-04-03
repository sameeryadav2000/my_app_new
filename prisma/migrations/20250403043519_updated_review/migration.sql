/*
  Warnings:

  - You are about to drop the column `modelId` on the `Review` table. All the data in the column will be lost.
  - Added the required column `phoneModelId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Made the column `colorId` on table `Review` required. This step will fail if there are existing NULL values in that column.
  - Made the column `purchasedItemId` on table `Review` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_colorId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_modelId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_purchasedItemId_fkey";

-- DropIndex
DROP INDEX "Review_modelId_idx";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "modelId",
ADD COLUMN     "phoneModelId" INTEGER NOT NULL,
ALTER COLUMN "colorId" SET NOT NULL,
ALTER COLUMN "purchasedItemId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Review_phoneModelId_idx" ON "Review"("phoneModelId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_phoneModelId_fkey" FOREIGN KEY ("phoneModelId") REFERENCES "PhoneModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_purchasedItemId_fkey" FOREIGN KEY ("purchasedItemId") REFERENCES "PurchasedItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
