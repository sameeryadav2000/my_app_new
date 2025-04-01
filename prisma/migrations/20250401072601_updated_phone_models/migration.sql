/*
  Warnings:

  - A unique constraint covering the columns `[model]` on the table `PhoneModel` will be added. If there are existing duplicate values, this will fail.
  - Made the column `image` on table `Phone` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Phone" ALTER COLUMN "image" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PhoneModel_model_key" ON "PhoneModel"("model");
