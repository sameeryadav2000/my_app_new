/*
  Warnings:

  - You are about to drop the column `phoneId` on the `ModelImage` table. All the data in the column will be lost.
  - Added the required column `phoneModelId` to the `ModelImage` table without a default value. This is not possible if the table is not empty.
  - Made the column `colorId` on table `ModelImage` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ModelImage" DROP CONSTRAINT "ModelImage_colorId_fkey";

-- DropForeignKey
ALTER TABLE "ModelImage" DROP CONSTRAINT "ModelImage_phoneId_fkey";

-- DropIndex
DROP INDEX "ModelImage_phoneId_idx";

-- AlterTable
ALTER TABLE "ModelImage" DROP COLUMN "phoneId",
ADD COLUMN     "phoneModelId" INTEGER NOT NULL,
ALTER COLUMN "colorId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "ModelImage_phoneModelId_idx" ON "ModelImage"("phoneModelId");

-- AddForeignKey
ALTER TABLE "ModelImage" ADD CONSTRAINT "ModelImage_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelImage" ADD CONSTRAINT "ModelImage_phoneModelId_fkey" FOREIGN KEY ("phoneModelId") REFERENCES "PhoneModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
