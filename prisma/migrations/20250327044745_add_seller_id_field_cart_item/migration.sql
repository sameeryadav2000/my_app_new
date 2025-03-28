-- AlterTable
ALTER TABLE `CartItem` ADD COLUMN `sellerId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `CartItem_sellerId_idx` ON `CartItem`(`sellerId`);

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `Seller`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
