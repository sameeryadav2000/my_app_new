/*
  Warnings:

  - You are about to drop the column `color` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `CartItem` table. All the data in the column will be lost.
  - You are about to drop the `Slideshow` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `colorId` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titleId` to the `CartItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `CartItem` DROP COLUMN `color`,
    DROP COLUMN `title`,
    ADD COLUMN `colorId` INTEGER NOT NULL,
    ADD COLUMN `titleId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `Slideshow`;

-- CreateIndex
CREATE INDEX `CartItem_titleId_idx` ON `CartItem`(`titleId`);

-- CreateIndex
CREATE INDEX `CartItem_colorId_idx` ON `CartItem`(`colorId`);

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_titleId_fkey` FOREIGN KEY (`titleId`) REFERENCES `PhoneModel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
