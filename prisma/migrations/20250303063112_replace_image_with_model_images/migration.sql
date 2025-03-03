/*
  Warnings:

  - You are about to drop the column `image` on the `IphoneModels` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `IphoneModels` DROP COLUMN `image`;

-- CreateTable
CREATE TABLE `ModelImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `image` VARCHAR(255) NOT NULL,
    `iphoneModelId` INTEGER NOT NULL,

    INDEX `ModelImage_iphoneModelId_idx`(`iphoneModelId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ModelImage` ADD CONSTRAINT `ModelImage_iphoneModelId_fkey` FOREIGN KEY (`iphoneModelId`) REFERENCES `IphoneModels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
