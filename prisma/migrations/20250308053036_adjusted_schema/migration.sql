/*
  Warnings:

  - You are about to drop the column `iphoneModelId` on the `ModelImage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `ModelImage` DROP FOREIGN KEY `ModelImage_iphoneModelId_fkey`;

-- DropIndex
DROP INDEX `ModelImage_iphoneModelId_idx` ON `ModelImage`;

-- AlterTable
ALTER TABLE `ModelImage` DROP COLUMN `iphoneModelId`,
    ADD COLUMN `iphoneId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `IphoneModels_colorId_idx` ON `IphoneModels`(`colorId`);

-- CreateIndex
CREATE INDEX `ModelImage_iphoneId_idx` ON `ModelImage`(`iphoneId`);

-- CreateIndex
CREATE INDEX `ModelImage_colorId_idx` ON `ModelImage`(`colorId`);

-- AddForeignKey
ALTER TABLE `ModelImage` ADD CONSTRAINT `ModelImage_iphoneId_fkey` FOREIGN KEY (`iphoneId`) REFERENCES `Iphone`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
