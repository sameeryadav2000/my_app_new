-- DropForeignKey
ALTER TABLE `Seller` DROP FOREIGN KEY `Seller_adminId_fkey`;

-- AddForeignKey
ALTER TABLE `Seller` ADD CONSTRAINT `Seller_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
