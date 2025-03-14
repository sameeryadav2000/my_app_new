-- CreateTable
CREATE TABLE `PhoneModelDropdown` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `model` VARCHAR(255) NOT NULL,
    `phoneId` INTEGER NOT NULL,

    INDEX `PhoneModelDropdown_phoneId_idx`(`phoneId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PhoneModelDropdown` ADD CONSTRAINT `PhoneModelDropdown_phoneId_fkey` FOREIGN KEY (`phoneId`) REFERENCES `Phone`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
