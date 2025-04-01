/*
  Warnings:

  - You are about to drop the column `phoneId` on the `PhoneModelDetails` table. All the data in the column will be lost.
  - Added the required column `phoneModelId` to the `PhoneModelDetails` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PhoneModelDetails" DROP CONSTRAINT "PhoneModelDetails_phoneId_fkey";

-- DropIndex
DROP INDEX "PhoneModelDetails_phoneId_idx";

-- AlterTable
ALTER TABLE "PhoneModelDetails" DROP COLUMN "phoneId",
ADD COLUMN     "phoneModelId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "PhoneModelDetails_phoneModelId_idx" ON "PhoneModelDetails"("phoneModelId");

-- AddForeignKey
ALTER TABLE "PhoneModelDetails" ADD CONSTRAINT "PhoneModelDetails_phoneModelId_fkey" FOREIGN KEY ("phoneModelId") REFERENCES "PhoneModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
