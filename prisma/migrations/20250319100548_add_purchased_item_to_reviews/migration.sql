/*
  Warnings:

  - A unique constraint covering the columns `[purchasedItemId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Review` ADD COLUMN `purchasedItemId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Review_purchasedItemId_key` ON `Review`(`purchasedItemId`);

-- CreateIndex
CREATE INDEX `Review_purchasedItemId_idx` ON `Review`(`purchasedItemId`);

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_purchasedItemId_fkey` FOREIGN KEY (`purchasedItemId`) REFERENCES `PurchasedItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
