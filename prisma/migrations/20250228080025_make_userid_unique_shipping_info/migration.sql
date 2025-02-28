/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `ShippingInfo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ShippingInfo_userId_key` ON `ShippingInfo`(`userId`);
