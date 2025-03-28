-- DropForeignKey
ALTER TABLE `PhoneModelDetails` DROP FOREIGN KEY `PhoneModelDetails_createdBy_fkey`;

-- AddForeignKey
ALTER TABLE `PhoneModelDetails` ADD CONSTRAINT `PhoneModelDetails_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `Admin`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
