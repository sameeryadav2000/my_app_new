/*
  Warnings:

  - Added the required column `sellerId` to the `PurchasedItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PurchasedItem` ADD COLUMN `sellerId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `PurchasedItem_sellerId_idx` ON `PurchasedItem`(`sellerId`);

-- AddForeignKey
ALTER TABLE `PurchasedItem` ADD CONSTRAINT `PurchasedItem_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `Seller`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
