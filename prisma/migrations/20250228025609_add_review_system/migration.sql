/*
  Warnings:

  - You are about to alter the column `iphoneId` on the `IphoneModels` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Int`.

*/
-- AlterTable
ALTER TABLE `IphoneModels` MODIFY `iphoneId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Review` (
    `id` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `comment` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `modelId` INTEGER NOT NULL,

    INDEX `Review_userId_idx`(`userId`),
    INDEX `Review_modelId_idx`(`modelId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `IphoneModels_iphoneId_idx` ON `IphoneModels`(`iphoneId`);

-- AddForeignKey
ALTER TABLE `IphoneModels` ADD CONSTRAINT `IphoneModels_iphoneId_fkey` FOREIGN KEY (`iphoneId`) REFERENCES `Iphone`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_modelId_fkey` FOREIGN KEY (`modelId`) REFERENCES `IphoneModels`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
