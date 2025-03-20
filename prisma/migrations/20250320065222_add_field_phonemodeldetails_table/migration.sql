/*
  Warnings:

  - You are about to drop the column `bestseller` on the `PhoneModel` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `PhoneModel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `PhoneModel` DROP COLUMN `bestseller`,
    DROP COLUMN `price`;

-- AlterTable
ALTER TABLE `PhoneModelDetails` ADD COLUMN `available` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `purchased` BOOLEAN NOT NULL DEFAULT false;
