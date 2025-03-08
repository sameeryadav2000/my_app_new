-- DropForeignKey
ALTER TABLE `ModelImage` DROP FOREIGN KEY `ModelImage_iphoneModelId_fkey`;

-- AlterTable
ALTER TABLE `IphoneModels` ADD COLUMN `colorId` INTEGER NULL;

-- AlterTable
ALTER TABLE `ModelImage` ADD COLUMN `colorId` INTEGER NULL,
    MODIFY `iphoneModelId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `ModelImage` ADD CONSTRAINT `ModelImage_iphoneModelId_fkey` FOREIGN KEY (`iphoneModelId`) REFERENCES `IphoneModels`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
