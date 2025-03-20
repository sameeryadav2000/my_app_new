-- CreateTable
CREATE TABLE `Seller` (
    `id` VARCHAR(191) NOT NULL,
    `businessName` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `address` TEXT NOT NULL,
    `taxId` VARCHAR(50) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `adminId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Seller_email_key`(`email`),
    INDEX `Seller_email_idx`(`email`),
    INDEX `Seller_adminId_idx`(`adminId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Seller` ADD CONSTRAINT `Seller_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
