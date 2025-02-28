-- AlterTable
ALTER TABLE `CartItem` ADD COLUMN `orderId` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('IN_CART', 'PURCHASED') NOT NULL DEFAULT 'IN_CART';

-- CreateIndex
CREATE INDEX `CartItem_status_idx` ON `CartItem`(`status`);
