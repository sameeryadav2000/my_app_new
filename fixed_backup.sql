-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
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
-- Current Database: `mydatabase`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `mydatabase` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `mydatabase`;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add user',4,'add_user'),(14,'Can change user',4,'change_user'),(15,'Can delete user',4,'delete_user'),(16,'Can view user',4,'view_user'),(17,'Can add content type',5,'add_contenttype'),(18,'Can change content type',5,'change_contenttype'),(19,'Can delete content type',5,'delete_contenttype'),(20,'Can view content type',5,'view_contenttype'),(21,'Can add session',6,'add_session'),(22,'Can change session',6,'change_session'),(23,'Can delete session',6,'delete_session'),(24,'Can view session',6,'view_session'),(25,'Can add shop most wanted',7,'add_shopmostwanted'),(26,'Can change shop most wanted',7,'change_shopmostwanted'),(27,'Can delete shop most wanted',7,'delete_shopmostwanted'),(28,'Can view shop most wanted',7,'view_shopmostwanted'),(29,'Can add slideshow images',8,'add_slideshowimages'),(30,'Can change slideshow images',8,'change_slideshowimages'),(31,'Can delete slideshow images',8,'delete_slideshowimages'),(32,'Can view slideshow images',8,'view_slideshowimages'),(33,'Can add i phone',9,'add_iphone'),(34,'Can change i phone',9,'change_iphone'),(35,'Can delete i phone',9,'delete_iphone'),(36,'Can view i phone',9,'view_iphone'),(37,'Can add samsung',10,'add_samsung'),(38,'Can change samsung',10,'change_samsung'),(39,'Can delete samsung',10,'delete_samsung'),(40,'Can view samsung',10,'view_samsung'),(41,'Can add vivo',11,'add_vivo'),(42,'Can change vivo',11,'change_vivo'),(43,'Can delete vivo',11,'delete_vivo'),(44,'Can view vivo',11,'view_vivo'),(45,'Can add xiaomi',12,'add_xiaomi'),(46,'Can change xiaomi',12,'change_xiaomi'),(47,'Can delete xiaomi',12,'delete_xiaomi'),(48,'Can view xiaomi',12,'view_xiaomi'),(49,'Can add iphone_models',13,'add_iphone_models'),(50,'Can change iphone_models',13,'change_iphone_models'),(51,'Can delete iphone_models',13,'delete_iphone_models'),(52,'Can view iphone_models',13,'view_iphone_models');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user`
--

DROP TABLE IF EXISTS `auth_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user`
--

LOCK TABLES `auth_user` WRITE;
/*!40000 ALTER TABLE `auth_user` DISABLE KEYS */;
INSERT INTO `auth_user` VALUES (1,'pbkdf2_sha256$870000$8uC28V5r92kYfYeoVHTrBt$SYZg03bnWNJ67aykqkoy+fu57zcNjtFEVtTMrahRa2A=','2025-02-01 19:17:52.254662',1,'sameer','','','',1,1,'2025-01-31 07:44:32.125787');
/*!40000 ALTER TABLE `auth_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_groups`
--

DROP TABLE IF EXISTS `auth_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_groups`
--

LOCK TABLES `auth_user_groups` WRITE;
/*!40000 ALTER TABLE `auth_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_user_permissions`
--

DROP TABLE IF EXISTS `auth_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_user_permissions`
--

LOCK TABLES `auth_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `auth_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
INSERT INTO `django_admin_log` VALUES (1,'2025-02-01 18:37:18.068104','1','iPhone',2,'[{\"changed\": {\"fields\": [\"Image\"]}}]',7,1),(2,'2025-02-01 18:38:49.959308','1','iPhone',2,'[{\"changed\": {\"fields\": [\"Image\"]}}]',7,1),(3,'2025-02-01 18:39:02.677031','1','iPhone',2,'[]',7,1),(4,'2025-02-01 18:39:08.631394','1','iPhone',2,'[{\"changed\": {\"fields\": [\"Image\"]}}]',7,1),(5,'2025-02-01 19:27:27.681705','2','Image: /media/slideshowImages/slideshowImage0.jpg',1,'[{\"added\": {}}]',8,1);
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(3,'auth','group'),(2,'auth','permission'),(4,'auth','user'),(5,'contenttypes','contenttype'),(9,'myApp','iphone'),(13,'myApp','iphone_models'),(10,'myApp','samsung'),(7,'myApp','shopmostwanted'),(8,'myApp','slideshowimages'),(11,'myApp','vivo'),(12,'myApp','xiaomi'),(6,'sessions','session');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2025-01-31 07:37:36.039212'),(2,'auth','0001_initial','2025-01-31 07:37:36.519667'),(3,'admin','0001_initial','2025-01-31 07:37:36.641340'),(4,'admin','0002_logentry_remove_auto_add','2025-01-31 07:37:36.648429'),(5,'admin','0003_logentry_add_action_flag_choices','2025-01-31 07:37:36.654653'),(6,'contenttypes','0002_remove_content_type_name','2025-01-31 07:37:36.735564'),(7,'auth','0002_alter_permission_name_max_length','2025-01-31 07:37:36.782580'),(8,'auth','0003_alter_user_email_max_length','2025-01-31 07:37:36.798543'),(9,'auth','0004_alter_user_username_opts','2025-01-31 07:37:36.804633'),(10,'auth','0005_alter_user_last_login_null','2025-01-31 07:37:36.853728'),(11,'auth','0006_require_contenttypes_0002','2025-01-31 07:37:36.855726'),(12,'auth','0007_alter_validators_add_error_messages','2025-01-31 07:37:36.860822'),(13,'auth','0008_alter_user_username_max_length','2025-01-31 07:37:36.912975'),(14,'auth','0009_alter_user_last_name_max_length','2025-01-31 07:37:36.963071'),(15,'auth','0010_alter_group_name_max_length','2025-01-31 07:37:36.976968'),(16,'auth','0011_update_proxy_permissions','2025-01-31 07:37:36.982964'),(17,'auth','0012_alter_user_first_name_max_length','2025-01-31 07:37:37.031436'),(18,'sessions','0001_initial','2025-01-31 07:37:37.059387'),(19,'myApp','0001_initial','2025-01-31 07:52:11.560315'),(20,'myApp','0002_shopmostwanted_image','2025-02-01 18:34:10.852564'),(21,'myApp','0003_slideshowimages','2025-02-01 19:13:21.164973'),(22,'myApp','0004_iphone','2025-02-01 19:53:27.172799'),(23,'myApp','0005_samsung_vivo_xiaomi_alter_iphone_image','2025-02-01 20:09:09.945493'),(24,'myApp','0006_iphone_models','2025-02-03 18:17:02.496721'),(25,'myApp','0007_iphone_carrier','2025-02-03 19:21:16.985763'),(26,'myApp','0008_iphone_models_carrier_iphone_models_iphone','2025-02-03 19:44:51.467527'),(27,'myApp','0009_iphone_models_available','2025-02-04 07:16:50.465354');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
INSERT INTO `django_session` VALUES ('6ici5t21lzsujrzgy7ea8yf221gxbudy','.eJxVjEEOwiAQRe_C2hAI7TC4dO8ZCO3MSNVAUtpV491tky50-997f1MxrUuOa-M5TqSuyqrL7zak8cXlAPRM5VH1WMsyT4M-FH3Spu-V-H073b-DnFrea9Oh80jiAxCEzhnyBGwxGAzcs4UAnkmwk91jCSahIANg70xiYfX5AsJSN44:1teJ04:bFKWyNkH9LLSSOJV1pAEjSoNHcBk8yhbGOTDTAlz1ek','2025-02-15 19:17:52.261203');
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `iphone`
--

DROP TABLE IF EXISTS `iphone`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `iphone` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `bestseller` varchar(3) NOT NULL,
  `title` varchar(200) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(100) NOT NULL,
  `carrier` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `iphone`
--

LOCK TABLES `iphone` WRITE;
/*!40000 ALTER TABLE `iphone` DISABLE KEYS */;
INSERT INTO `iphone` VALUES (3,'no','iPhone 13',19.90,'../../iphone_images/image.png','unlocked');
/*!40000 ALTER TABLE `iphone` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `iphone_models`
--

DROP TABLE IF EXISTS `iphone_models`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `iphone_models` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `condition` varchar(20) NOT NULL,
  `storage` varchar(50) NOT NULL,
  `color` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `carrier` varchar(20) NOT NULL,
  `iphone_id` bigint DEFAULT NULL,
  `available` varchar(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `myApp_iphone_models_iphone_id_d88d0d48_fk_myApp_iphone_id` (`iphone_id`),
  CONSTRAINT `myApp_iphone_models_iphone_id_d88d0d48_fk_myApp_iphone_id` FOREIGN KEY (`iphone_id`) REFERENCES `iphone` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `iphone_models`
--

LOCK TABLES `iphone_models` WRITE;
/*!40000 ALTER TABLE `iphone_models` DISABLE KEYS */;
INSERT INTO `iphone_models` VALUES (3,'iPhone 12','new','128','Red',2.00,'unlocked',3,'no'),(4,'iPhone 12','new','128','Blue',3.00,'unlocked',3,'no'),(5,'iPhone 12','new','128','Green',4.00,'unlocked',3,'yes'),(6,'iPhone 12','new','128','Pink',5.00,'unlocked',3,'yes'),(7,'iPhone 12','new','256','Black',15.00,'unlocked',3,'yes'),(8,'iPhone 12','new','256','Red',6.00,'unlocked',3,'yes'),(9,'iPhone 12','new','256','Blue',7.00,'unlocked',3,'yes'),(10,'iPhone 12','new','256','Green',8.00,'unlocked',3,'yes'),(11,'iPhone 12','new','256','Pink',9.00,'unlocked',3,'yes'),(12,'iPhone 12','new','512','Black',16.00,'unlocked',3,'yes'),(13,'iPhone 12','new','512','Red',10.00,'unlocked',3,'yes'),(14,'iPhone 12','new','512','Blue',12.00,'unlocked',3,'yes'),(15,'iPhone 12','new','512','Green',13.00,'unlocked',3,'yes'),(16,'iPhone 12','new','512','Pink',14.00,'unlocked',3,'yes'),(17,'iPhone 12','fair','128','Black',17.00,'unlocked',3,'yes'),(18,'iPhone 12','fair','128','Red',18.00,'unlocked',3,'yes'),(19,'iPhone 12','fair','128','Blue',19.00,'unlocked',3,'yes'),(20,'iPhone 12','fair','128','Green',20.00,'unlocked',3,'yes'),(21,'iPhone 12','fair','128','Pink',21.00,'unlocked',3,'yes'),(22,'iPhone 12','fair','256','Black',22.00,'unlocked',3,'yes'),(23,'iPhone 12','fair','25633','Red',23.00,'unlocked',3,'yes'),(24,'iPhone 12','fair','256','Blue',24.00,'unlocked',3,'yes'),(25,'iPhone 12','fair','256','Green',25.00,'unlocked',3,'yes'),(26,'iPhone 12','fair','256','Pink',26.00,'unlocked',3,'yes'),(27,'iPhone 12','fair','512','Black',27.00,'unlocked',3,'yes'),(28,'iPhone 12','fair','512','Red',28.00,'unlocked',3,'yes'),(29,'iPhone 12','fair','512','Blue',29.00,'unlocked',3,'yes'),(30,'iPhone 12','fair','512','Green',30.00,'unlocked',3,'yes'),(31,'iPhone 12','fair','512','Pink',31.00,'unlocked',3,'yes'),(32,'iPhone 12','good','128','Black',32.00,'unlocked',3,'yes'),(33,'iPhone 12','good','128','Red',33.00,'unlocked',3,'yes'),(34,'iPhone 12','good','128','Blue',34.00,'unlocked',3,'yes'),(35,'iPhone 12','good','128','Green',35.00,'unlocked',3,'yes'),(36,'iPhone 12','good','128','Pink',36.00,'unlocked',3,'yes'),(37,'iPhone 12','good','256','Black',37.00,'unlocked',3,'yes'),(38,'iPhone 12','good','256','Red',38.00,'unlocked',3,'yes'),(39,'iPhone 12','good','256','Blue',39.00,'unlocked',3,'yes'),(40,'iPhone 12','good','256','Green',40.00,'unlocked',3,'yes'),(41,'iPhone 12','good','256','Pink',41.00,'unlocked',3,'yes'),(42,'iPhone 12','good','512','Black',42.00,'unlocked',3,'yes'),(43,'iPhone 12','good','512','Red',43.00,'unlocked',3,'yes'),(44,'iPhone 12','good','512','Blue',44.00,'unlocked',3,'yes'),(45,'iPhone 12','good','512','Green',45.00,'unlocked',3,'yes'),(46,'iPhone 12','good','512','Pink',46.00,'unlocked',3,'yes'),(47,'iPhone 12','excellent','128','Black',47.00,'unlocked',3,'yes'),(48,'iPhone 12','excellent','128','Red',48.00,'unlocked',3,'yes'),(49,'iPhone 12','excellent','128','Blue',49.00,'unlocked',3,'yes'),(50,'iPhone 12','excellent','128','Green',50.00,'unlocked',3,'yes'),(51,'iPhone 12','excellent','128','Pink',51.00,'unlocked',3,'yes'),(52,'iPhone 12','excellent','256','Black',52.00,'unlocked',3,'yes'),(53,'iPhone 12','excellent','256','Red',53.00,'unlocked',3,'yes'),(54,'iPhone 12','excellent','256','Blue',54.00,'unlocked',3,'yes'),(55,'iPhone 12','excellent','256','Green',55.00,'unlocked',3,'yes'),(56,'iPhone 12','excellent','256','Pink',56.00,'unlocked',3,'yes'),(57,'iPhone 12','excellent','512','Black',57.00,'unlocked',3,'yes'),(58,'iPhone 12','excellent','512','Red',58.00,'unlocked',3,'yes'),(59,'iPhone 12','excellent','512','Blue',59.00,'unlocked',3,'yes'),(60,'iPhone 12','excellent','512','Green',60.00,'unlocked',3,'yes'),(61,'iPhone 12','excellent','512','Pink',61.00,'unlocked',3,'yes');
/*!40000 ALTER TABLE `iphone_models` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `myapp_samsung`
--

DROP TABLE IF EXISTS `myapp_samsung`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `myapp_samsung` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `bestseller` varchar(3) NOT NULL,
  `title` varchar(200) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `myapp_samsung`
--

LOCK TABLES `myapp_samsung` WRITE;
/*!40000 ALTER TABLE `myapp_samsung` DISABLE KEYS */;
/*!40000 ALTER TABLE `myapp_samsung` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `myapp_vivo`
--

DROP TABLE IF EXISTS `myapp_vivo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `myapp_vivo` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `bestseller` varchar(3) NOT NULL,
  `title` varchar(200) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `myapp_vivo`
--

LOCK TABLES `myapp_vivo` WRITE;
/*!40000 ALTER TABLE `myapp_vivo` DISABLE KEYS */;
/*!40000 ALTER TABLE `myapp_vivo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `myapp_xiaomi`
--

DROP TABLE IF EXISTS `myapp_xiaomi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `myapp_xiaomi` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `bestseller` varchar(3) NOT NULL,
  `title` varchar(200) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `myapp_xiaomi`
--

LOCK TABLES `myapp_xiaomi` WRITE;
/*!40000 ALTER TABLE `myapp_xiaomi` DISABLE KEYS */;
/*!40000 ALTER TABLE `myapp_xiaomi` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shopmostwanted`
--

DROP TABLE IF EXISTS `shopmostwanted`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shopmostwanted` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `image` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shopmostwanted`
--

LOCK TABLES `shopmostwanted` WRITE;
/*!40000 ALTER TABLE `shopmostwanted` DISABLE KEYS */;
INSERT INTO `shopmostwanted` VALUES (1,'iPhone','phone_images/image.png'),(2,'Samsung','phone_images/image.png'),(3,'Xiaomi','phone_images/image.png'),(4,'Vivo','phone_images/image.png');
/*!40000 ALTER TABLE `shopmostwanted` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `slideshowimages`
--

DROP TABLE IF EXISTS `slideshowimages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `slideshowimages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `image` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `slideshowimages`
--

LOCK TABLES `slideshowimages` WRITE;
/*!40000 ALTER TABLE `slideshowimages` DISABLE KEYS */;
INSERT INTO `slideshowimages` VALUES (1,'slideshow_images/slideshowImage0.jpg'),(2,'slideshow_images/slideshowImage1.jpg');
/*!40000 ALTER TABLE `slideshowimages` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-13 18:28:48
