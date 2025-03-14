/*
  Warnings:

  - You are about to drop the column `iphoneId` on the `ModelImage` table. All the data in the column will be lost.
  - You are about to drop the `Iphone` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IphoneModels` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PhoneModelDropdown` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `IphoneModels` DROP FOREIGN KEY `IphoneModels_iphoneId_fkey`;

-- DropForeignKey
ALTER TABLE `ModelImage` DROP FOREIGN KEY `ModelImage_iphoneId_fkey`;

-- DropForeignKey
ALTER TABLE `PhoneModelDropdown` DROP FOREIGN KEY `PhoneModelDropdown_phoneId_fkey`;

-- DropForeignKey
ALTER TABLE `Review` DROP FOREIGN KEY `Review_modelId_fkey`;

-- DropIndex
DROP INDEX `ModelImage_iphoneId_idx` ON `ModelImage`;

-- AlterTable
ALTER TABLE `ModelImage` DROP COLUMN `iphoneId`,
    ADD COLUMN `phoneId` INTEGER NULL;

-- DropTable
DROP TABLE `Iphone`;

-- DropTable
DROP TABLE `IphoneModels`;

-- DropTable
DROP TABLE `PhoneModelDropdown`;

-- CreateTable
CREATE TABLE `PhoneModel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `model` VARCHAR(255) NOT NULL,
    `phoneId` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `bestseller` BOOLEAN NOT NULL DEFAULT false,

    INDEX `PhoneModel_phoneId_idx`(`phoneId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PhoneModelDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `phoneId` INTEGER NOT NULL,
    `storage` VARCHAR(50) NOT NULL,
    `condition` VARCHAR(50) NOT NULL,
    `color` VARCHAR(50) NOT NULL,
    `colorId` INTEGER NULL,
    `available` BOOLEAN NOT NULL DEFAULT true,
    `price` DOUBLE NOT NULL,

    INDEX `PhoneModelDetails_phoneId_idx`(`phoneId`),
    INDEX `PhoneModelDetails_colorId_idx`(`colorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ModelImage_phoneId_idx` ON `ModelImage`(`phoneId`);

-- AddForeignKey
ALTER TABLE `PhoneModel` ADD CONSTRAINT `PhoneModel_phoneId_fkey` FOREIGN KEY (`phoneId`) REFERENCES `Phone`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PhoneModelDetails` ADD CONSTRAINT `PhoneModelDetails_phoneId_fkey` FOREIGN KEY (`phoneId`) REFERENCES `PhoneModel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ModelImage` ADD CONSTRAINT `ModelImage_phoneId_fkey` FOREIGN KEY (`phoneId`) REFERENCES `PhoneModel`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_modelId_fkey` FOREIGN KEY (`modelId`) REFERENCES `PhoneModelDetails`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
