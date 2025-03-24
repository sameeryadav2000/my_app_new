-- DropForeignKey
ALTER TABLE `Review` DROP FOREIGN KEY `Review_modelId_fkey`;

-- AlterTable
ALTER TABLE `Review` ADD COLUMN `colorId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Review_colorId_idx` ON `Review`(`colorId`);

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_modelId_fkey` FOREIGN KEY (`modelId`) REFERENCES `PhoneModel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
