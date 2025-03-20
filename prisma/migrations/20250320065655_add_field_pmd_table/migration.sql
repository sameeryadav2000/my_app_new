-- AlterTable
ALTER TABLE `PhoneModelDetails` ADD COLUMN `sellerId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `PhoneModelDetails` ADD CONSTRAINT `PhoneModelDetails_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `Seller`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
