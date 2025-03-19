/*
  Warnings:

  - You are about to drop the column `orderId` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `CartItem` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `CartItem_status_idx` ON `CartItem`;

-- AlterTable
ALTER TABLE `CartItem` DROP COLUMN `orderId`,
    DROP COLUMN `status`;

-- CreateTable
CREATE TABLE `PurchasedItem` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `condition` VARCHAR(50) NOT NULL,
    `storage` VARCHAR(50) NOT NULL,
    `color` VARCHAR(50) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `image` VARCHAR(255) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PurchasedItem_userId_idx`(`userId`),
    INDEX `PurchasedItem_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PurchasedItem` ADD CONSTRAINT `PurchasedItem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
