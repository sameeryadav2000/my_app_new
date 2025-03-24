/*
  Warnings:

  - You are about to drop the column `color` on the `PurchasedItem` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `PurchasedItem` table. All the data in the column will be lost.
  - Added the required column `colorId` to the `PurchasedItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titleId` to the `PurchasedItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PurchasedItem` DROP COLUMN `color`,
    DROP COLUMN `title`,
    ADD COLUMN `colorId` INTEGER NOT NULL,
    ADD COLUMN `titleId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `PurchasedItem` ADD CONSTRAINT `PurchasedItem_titleId_fkey` FOREIGN KEY (`titleId`) REFERENCES `PhoneModel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchasedItem` ADD CONSTRAINT `PurchasedItem_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
