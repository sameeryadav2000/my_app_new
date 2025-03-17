-- MySQL dump 10.13  Distrib 8.0.41, for Linux (x86_64)
--
-- Host: localhost    Database: mydatabase
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `CartItem`
--

DROP TABLE IF EXISTS `CartItem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CartItem` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `itemId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `condition` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `storage` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `orderId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('IN_CART','PURCHASED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IN_CART',
  PRIMARY KEY (`id`),
  KEY `CartItem_userId_idx` (`userId`),
  KEY `CartItem_status_idx` (`status`),
  CONSTRAINT `CartItem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CartItem`
--

LOCK TABLES `CartItem` WRITE;
/*!40000 ALTER TABLE `CartItem` DISABLE KEYS */;
/*!40000 ALTER TABLE `CartItem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Color`
--

DROP TABLE IF EXISTS `Color`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Color` (
  `id` int NOT NULL AUTO_INCREMENT,
  `color` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Color`
--

LOCK TABLES `Color` WRITE;
/*!40000 ALTER TABLE `Color` DISABLE KEYS */;
INSERT INTO `Color` VALUES (1,'black'),(2,'white'),(3,'silver'),(4,'gold'),(5,'blue'),(6,'red'),(7,'purple'),(8,'green');
/*!40000 ALTER TABLE `Color` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ModelImage`
--

DROP TABLE IF EXISTS `ModelImage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ModelImage` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `colorId` int DEFAULT NULL,
  `phoneId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ModelImage_colorId_idx` (`colorId`),
  KEY `ModelImage_phoneId_idx` (`phoneId`),
  CONSTRAINT `ModelImage_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `ModelImage_phoneId_fkey` FOREIGN KEY (`phoneId`) REFERENCES `PhoneModel` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ModelImage`
--

LOCK TABLES `ModelImage` WRITE;
/*!40000 ALTER TABLE `ModelImage` DISABLE KEYS */;
INSERT INTO `ModelImage` VALUES (2,'/phone_images/black/1.jpg',1,1),(3,'/phone_images/black/2.jpg',1,1),(4,'/phone_images/black/3.jpg',1,1),(5,'/phone_images/blue/1.jpg',5,1),(6,'/phone_images/blue/2.jpg',5,1),(7,'/phone_images/blue/3.jpg',5,2),(8,'/phone_images/black/4.jpg',1,1),(9,'/phone_images/green/1.jpg',8,1),(10,'/phone_images/green/2.jpg',8,1),(11,'/phone_images/green/3.jpg',8,1),(12,'/phone_images/blue/4.jpg',5,1);
/*!40000 ALTER TABLE `ModelImage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Phone`
--

DROP TABLE IF EXISTS `Phone`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Phone` (
  `id` int NOT NULL AUTO_INCREMENT,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Phone`
--

LOCK TABLES `Phone` WRITE;
/*!40000 ALTER TABLE `Phone` DISABLE KEYS */;
INSERT INTO `Phone` VALUES (1,'iPhone'),(2,'Samsung');
/*!40000 ALTER TABLE `Phone` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PhoneModel`
--

DROP TABLE IF EXISTS `PhoneModel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PhoneModel` (
  `id` int NOT NULL AUTO_INCREMENT,
  `model` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phoneId` int NOT NULL,
  `price` double NOT NULL,
  `bestseller` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `PhoneModel_phoneId_idx` (`phoneId`),
  CONSTRAINT `PhoneModel_phoneId_fkey` FOREIGN KEY (`phoneId`) REFERENCES `Phone` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PhoneModel`
--

LOCK TABLES `PhoneModel` WRITE;
/*!40000 ALTER TABLE `PhoneModel` DISABLE KEYS */;
INSERT INTO `PhoneModel` VALUES (1,'iPhone 14',1,257.88,0),(2,'iPhone 14 Pro',1,894.41,0),(3,'iPhone 14 Pro Max',1,798.39,0),(4,'iPhone 13',1,1208.72,0),(5,'iPhone 13 Pro',1,748.44,0),(6,'iPhone 12',1,1416.03,0),(7,'iPhone 12 Pro',1,534.82,0),(8,'iPhone 11',1,1126.04,0),(9,'iPhone SE (2022)',1,1125.71,0),(10,'Galaxy S23',2,750.42,0),(11,'Galaxy S23 Ultra',2,275,0),(12,'Galaxy S22',2,423.74,0),(13,'Galaxy S22 Plus',2,1193.71,0),(14,'Galaxy S21',2,397.31,0),(15,'Galaxy S21 Ultra',2,1105.42,0),(16,'Galaxy A54',2,1435.17,0),(17,'Galaxy A34',2,959.57,0),(18,'Galaxy Z Fold 5',2,392.37,0);
/*!40000 ALTER TABLE `PhoneModel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PhoneModelDetails`
--

DROP TABLE IF EXISTS `PhoneModelDetails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `PhoneModelDetails` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phoneId` int NOT NULL,
  `storage` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `condition` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `colorId` int DEFAULT NULL,
  `available` tinyint(1) NOT NULL DEFAULT '1',
  `price` double NOT NULL,
  `createdBy` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purchased` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `PhoneModelDetails_phoneId_idx` (`phoneId`),
  KEY `PhoneModelDetails_colorId_idx` (`colorId`),
  KEY `PhoneModelDetails_createdBy_idx` (`createdBy`),
  CONSTRAINT `PhoneModelDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `PhoneModelDetails_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `PhoneModelDetails_phoneId_fkey` FOREIGN KEY (`phoneId`) REFERENCES `PhoneModel` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PhoneModelDetails`
--

LOCK TABLES `PhoneModelDetails` WRITE;
/*!40000 ALTER TABLE `PhoneModelDetails` DISABLE KEYS */;
INSERT INTO `PhoneModelDetails` VALUES (8,'iPhone 14',1,'128','new',1,1,11,'f451d3fe-524d-491b-bd01-2477275ebac8',0);
/*!40000 ALTER TABLE `PhoneModelDetails` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Review`
--

DROP TABLE IF EXISTS `Review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Review` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `modelId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Review_userId_idx` (`userId`),
  KEY `Review_modelId_idx` (`modelId`),
  CONSTRAINT `Review_modelId_fkey` FOREIGN KEY (`modelId`) REFERENCES `PhoneModelDetails` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Review`
--

LOCK TABLES `Review` WRITE;
/*!40000 ALTER TABLE `Review` DISABLE KEYS */;
/*!40000 ALTER TABLE `Review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ShippingInfo`
--

DROP TABLE IF EXISTS `ShippingInfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ShippingInfo` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `firstName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `zipCode` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ShippingInfo_userId_key` (`userId`),
  KEY `ShippingInfo_userId_idx` (`userId`),
  CONSTRAINT `ShippingInfo_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ShippingInfo`
--

LOCK TABLES `ShippingInfo` WRITE;
/*!40000 ALTER TABLE `ShippingInfo` DISABLE KEYS */;
/*!40000 ALTER TABLE `ShippingInfo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Slideshow`
--

DROP TABLE IF EXISTS `Slideshow`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Slideshow` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Slideshow`
--

LOCK TABLES `Slideshow` WRITE;
/*!40000 ALTER TABLE `Slideshow` DISABLE KEYS */;
/*!40000 ALTER TABLE `Slideshow` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `externalId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `emailVerified` tinyint(1) NOT NULL DEFAULT '0',
  `firstName` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lastName` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phoneNumber` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` text COLLATE utf8mb4_unicode_ci,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `lastLoginAt` datetime(3) DEFAULT NULL,
  `admin` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  UNIQUE KEY `User_externalId_key` (`externalId`),
  KEY `User_email_idx` (`email`),
  KEY `User_externalId_idx` (`externalId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES ('f451d3fe-524d-491b-bd01-2477275ebac8','c67d3b17-1420-4110-b10b-ea2ab697d293','iamjohnscott6000@gmail.com',1,'sameer','yadav',NULL,NULL,1,'2025-03-14 09:55:20.154','2025-03-16 21:25:36.960','2025-03-16 21:25:36.959',1);
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('03e14ff0-5deb-4abf-9426-2ba74a11f953','5c1194d52d5bb86e23a026936ee1eef2d3d35e0d928e8432ea73d450bb36a328','2025-03-14 08:27:20.391','20250303021947_added_image_field_iphone_models',NULL,NULL,'2025-03-14 08:27:20.381',1),('11e24bd4-ec7e-4307-984b-3461eb4f3c1e','2f1e0750bd1d7e58fd150bc5a0a8a3132b8efeeb9ba6e2affb285539e8a7237c','2025-03-14 08:27:20.096','20250227045918_added_tables',NULL,NULL,'2025-03-14 08:27:19.902',1),('2d1c1b8e-bbb2-45c7-8892-e76f03d72b05','7520ced1d13c9c1a309fbe51cd3143851e4c27ed13b5c5d24385527d15c8a22f','2025-03-14 09:19:17.035','20250314091916_add_user_to_phone_model_details',NULL,NULL,'2025-03-14 09:19:16.930',1),('4250aa1d-d89f-4eb5-bbc0-ce55e2740876','7738279135776ac7aed000029b38322271160a9718e77d8875bdd8af76bdb4aa','2025-03-14 08:27:20.379','20250303021320_add_image_field_to_iphone_models',NULL,NULL,'2025-03-14 08:27:20.345',1),('4324d6b6-b26b-4327-b04b-899947b1fece','226eeb6a1a3c04a429addcc38edea79a408b38dfb38103f338f3d5b4f41ce9ff','2025-03-14 08:27:20.277','20250228025609_add_review_system',NULL,NULL,'2025-03-14 08:27:20.098',1),('47078b2e-4222-44d3-b869-2f60ad993890','8aec3623997738ace39020dfacb002b35d2f68ad5c0e5479f0176d2aa94b8932','2025-03-14 09:22:33.051','20250314092232_rename_userid_to_createdby',NULL,NULL,'2025-03-14 09:22:32.936',1),('5db305aa-f1e2-4a68-a3e6-4847680d3711','c82078191a88ccb1760195a3615483b149de9226ffb13ce19343ab1cfa603949','2025-03-14 08:27:20.736','20250313213659_add_admin_field_user_table',NULL,NULL,'2025-03-14 08:27:20.691',1),('70990530-3dca-4688-b9ba-bdd905729f75','51304cc7fcee9acc7592f20ab01662cf47a82d2e225d52456e687f84069d6665','2025-03-14 08:27:21.077','20250314072118_modified_tables',NULL,NULL,'2025-03-14 08:27:20.803',1),('7a05fa29-7643-4039-b59b-4dc91f62a616','0dde2d6a7faefc5f880e57e767924cf936e1a83f773d99efe127a8e8a6b31870','2025-03-14 08:27:20.578','20250308022939_add_color_id',NULL,NULL,'2025-03-14 08:27:20.477',1),('8fc4704e-4946-4708-b517-71f19f43fc67','afc9662ab12c2d3146ed4b9d8b53826a0ad6e785eada2615b3c8e3265fc12dba','2025-03-14 08:27:21.205','20250314082507_added_color_table',NULL,NULL,'2025-03-14 08:27:21.079',1),('9a5d2d1b-9942-48ec-acff-016ce2601552','534d52a8e4eda56390a4ab223e59c888070565f74c333b73eaad359224bd0597','2025-03-14 08:27:20.689','20250308053036_adjusted_schema',NULL,NULL,'2025-03-14 08:27:20.580',1),('c65547c4-5f71-4460-9359-c0948ff89e42','4b5c424fcda30ed4dc77abaa572764bcaff7932adb37a16f192777c1d179fa7f','2025-03-14 08:27:20.475','20250303063112_replace_image_with_model_images',NULL,NULL,'2025-03-14 08:27:20.393',1),('cbeab9c8-8f4c-44a1-bfd7-077e3fde3fc2','4cd87dc339da482804fc3c8f60c9273838e0a88494549db3a1b1bf5d0b2708de','2025-03-14 08:27:20.343','20250228090933_added_status_field_cart_item',NULL,NULL,'2025-03-14 08:27:20.299',1),('d91207b9-864d-4738-adb9-c20d9d77b72b','b3d94a94b263271d35b1d34ce1b76f6358d8281c25c4e832efe7eca94e0f7130','2025-03-14 08:27:20.296','20250228080025_make_userid_unique_shipping_info',NULL,NULL,'2025-03-14 08:27:20.279',1),('e21aba19-18cc-46f1-a505-371126104c1e','f674d93eeebe3b8b1a926c8d7c0b523354a795475745ed518311d544f1f7f204','2025-03-14 08:27:20.801','20250314001526_add_phone_model_dropdown_table',NULL,NULL,'2025-03-14 08:27:20.738',1),('f4162e31-911f-483b-a6b7-f46733fe36a6','eb71de83b1714b59e7bf5b3019db18fccd2f8e04fc71ef38cedea840396e49f9','2025-03-14 22:29:02.520','20250314222902_add_field_purchased_phone_model_details',NULL,NULL,'2025-03-14 22:29:02.498',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-17  9:34:47
