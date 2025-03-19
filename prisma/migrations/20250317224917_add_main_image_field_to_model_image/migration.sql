/*
  Warnings:

  - You are about to drop the column `available` on the `PhoneModelDetails` table. All the data in the column will be lost.
  - You are about to drop the column `purchased` on the `PhoneModelDetails` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ModelImage` ADD COLUMN `mainImage` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `PhoneModelDetails` DROP COLUMN `available`,
    DROP COLUMN `purchased`;
