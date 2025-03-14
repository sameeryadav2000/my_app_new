/*
  Warnings:

  - You are about to drop the column `userId` on the `PhoneModelDetails` table. All the data in the column will be lost.
  - Added the required column `createdBy` to the `PhoneModelDetails` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `PhoneModelDetails` DROP FOREIGN KEY `PhoneModelDetails_userId_fkey`;

-- DropIndex
DROP INDEX `PhoneModelDetails_userId_idx` ON `PhoneModelDetails`;

-- AlterTable
ALTER TABLE `PhoneModelDetails` DROP COLUMN `userId`,
    ADD COLUMN `createdBy` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `PhoneModelDetails_createdBy_idx` ON `PhoneModelDetails`(`createdBy`);

-- AddForeignKey
ALTER TABLE `PhoneModelDetails` ADD CONSTRAINT `PhoneModelDetails_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
