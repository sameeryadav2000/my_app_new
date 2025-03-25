-- DropForeignKey
ALTER TABLE `Review` DROP FOREIGN KEY `Review_modelId_fkey`;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_modelId_fkey` FOREIGN KEY (`modelId`) REFERENCES `PhoneModel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
