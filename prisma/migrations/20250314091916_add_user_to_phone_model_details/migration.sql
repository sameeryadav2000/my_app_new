/*
  Warnings:

  - Added the required column `userId` to the `PhoneModelDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PhoneModelDetails` ADD COLUMN `userId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `PhoneModelDetails_userId_idx` ON `PhoneModelDetails`(`userId`);

-- AddForeignKey
ALTER TABLE `PhoneModelDetails` ADD CONSTRAINT `PhoneModelDetails_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
