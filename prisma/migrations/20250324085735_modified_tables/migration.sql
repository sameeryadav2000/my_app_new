/*
  Warnings:

  - You are about to drop the column `titleId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `titleId` on the `PurchasedItem` table. All the data in the column will be lost.
  - Added the required column `phoneModelId` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneModelId` to the `PurchasedItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `CartItem` DROP FOREIGN KEY `CartItem_titleId_fkey`;

-- DropForeignKey
ALTER TABLE `PurchasedItem` DROP FOREIGN KEY `PurchasedItem_titleId_fkey`;

-- DropIndex
DROP INDEX `CartItem_titleId_idx` ON `CartItem`;

-- DropIndex
DROP INDEX `PurchasedItem_titleId_fkey` ON `PurchasedItem`;

-- AlterTable
ALTER TABLE `CartItem` DROP COLUMN `titleId`,
    ADD COLUMN `phoneModelId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `PurchasedItem` DROP COLUMN `titleId`,
    ADD COLUMN `phoneModelId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `CartItem_phoneModelId_idx` ON `CartItem`(`phoneModelId`);

-- CreateIndex
CREATE INDEX `PurchasedItem_phoneModelId_idx` ON `PurchasedItem`(`phoneModelId`);

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_phoneModelId_fkey` FOREIGN KEY (`phoneModelId`) REFERENCES `PhoneModel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchasedItem` ADD CONSTRAINT `PurchasedItem_phoneModelId_fkey` FOREIGN KEY (`phoneModelId`) REFERENCES `PhoneModel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
