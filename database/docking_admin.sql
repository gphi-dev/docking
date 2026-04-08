-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 08, 2026 at 05:06 AM
-- Server version: 9.6.0
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `docking_admin`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int UNSIGNED NOT NULL,
  `username` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `username`, `password_hash`, `created_at`) VALUES
(1, 'admin', '$2a$12$rJI/bzCoxxNcPPySME.eWeeLDbZQ/klpkRKj85Vx3s6onGn/4k.1.', '2026-04-06 08:36:04'),
(2, 'DevJulo', '$2a$12$rJI/bzCoxxNcPPySME.eWeeLDbZQ/klpkRKj85Vx3s6onGn/4k.1.', '2026-04-07 11:46:07');

-- --------------------------------------------------------

--
-- Table structure for table `games`
--

CREATE TABLE `games` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(2048) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `games`
--

INSERT INTO `games` (`id`, `name`, `description`, `image_url`, `created_at`) VALUES
(1, 'Shabong Frenzy', 'Manok manokan', 'https://t4.ftcdn.net/jpg/07/68/11/93/240_F_768119371_8UAHPq8o2laeHuh7qUZRFu4qHUOmauDF.jpg', '2026-04-06 08:49:37'),
(2, 'SabongSagad', 'local sabong for PH', 'https://as1.ftcdn.net/v2/jpg/08/29/56/44/1000_F_829564400_nVcTl2R5OHjzfhAedfvLE6i5W9kCxBsm.jpg', '2026-04-06 08:55:39'),
(3, 'Chicken Ninja', 'RPG sabong', 'https://t4.ftcdn.net/jpg/06/72/53/29/240_F_672532957_nQlJFGOMGjbDAFawHU6ySuSYCAafw2AP.jpg', '2026-04-06 09:09:42'),
(4, 'ShaboXing', 'Boxing ng manok', 'https://t3.ftcdn.net/jpg/15/97/31/36/240_F_1597313652_Qbf3PZaymphVRv56Pg3UXlZkAwY12ljj.jpg', '2026-04-06 09:19:30');

-- --------------------------------------------------------

--
-- Table structure for table `subscribers`
--

CREATE TABLE `subscribers` (
  `id` int UNSIGNED NOT NULL,
  `game_id` int UNSIGNED NOT NULL,
  `phone_number` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `usersmobile`
--

CREATE TABLE `usersmobile` (
  `id` bigint UNSIGNED NOT NULL,
  `phone` varchar(20) NOT NULL,
  `game_id` varchar(50) NOT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `verified_at` datetime DEFAULT NULL,
  `otp` varchar(6) DEFAULT NULL,
  `otp_expires_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) DEFAULT NULL,
  `updated_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `usersmobile`
--

INSERT INTO `usersmobile` (`id`, `phone`, `game_id`, `is_verified`, `verified_at`, `otp`, `otp_expires_at`, `created_at`, `updated_at`) VALUES
(1, '09263257968', 'MarioBro', 1, '2026-04-02 14:05:51', '502073', '2026-04-02 14:10:38.894', '2026-04-02 13:59:15.198', '2026-04-02 14:05:50.891'),
(2, '09283785436', 'bingoGPHI', 1, '2026-04-02 15:42:55', '818431', '2026-04-02 15:47:11.537', '2026-04-02 15:36:29.424', '2026-04-02 15:42:54.753'),
(3, '09175432431', 'online saksakan', 1, '2026-04-02 15:52:45', '213305', '2026-04-02 15:57:23.279', '2026-04-02 15:50:39.152', '2026-04-02 15:52:44.632'),
(4, '09195432431', '1', 1, '2026-04-02 15:54:06', '798356', '2026-04-02 15:58:40.651', '2026-04-02 15:53:30.751', '2026-04-02 15:54:05.954'),
(5, '09215437689', 'dart_gphi', 1, '2026-04-02 16:55:51', '256377', '2026-04-02 17:00:33.482', '2026-04-02 16:55:22.679', '2026-04-02 16:55:51.158'),
(6, '09275437689', 'Floppy Shabong', 1, '2026-04-02 17:02:36', '488710', '2026-04-02 17:07:24.799', '2026-04-02 17:02:00.868', '2026-04-02 17:02:35.739'),
(7, '09271357667', 'NEW_USER_001', 0, NULL, '291974', '2026-04-03 11:25:48.275', '2026-04-03 10:52:14.262', '2026-04-03 11:20:48.275'),
(8, 'dummy_num_001', 'NEW_GAMER_100', 1, '2026-04-03 11:05:50', '425370', '2026-04-03 11:07:36.902', '2026-04-03 11:01:22.847', '2026-04-03 11:05:50.206'),
(9, '09887776655', 'LAGING_OTP_GAMER', 1, '2026-04-03 11:17:33', '543244', '2026-04-03 11:19:02.824', '2026-04-03 11:11:39.945', '2026-04-03 11:17:33.354'),
(10, 'test_number_001', 'NEW_PLAYER_999', 0, NULL, '', '2026-04-03 11:24:15.905', '2026-04-03 11:24:15.905', '2026-04-03 11:24:15.905'),
(11, '09271357667', 'POSTMAN_GAMER_99', 1, '2026-04-03 12:01:59', '773836', '2026-04-03 12:07:27.382', '2026-04-03 11:27:53.077', '2026-04-03 12:02:27.382');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_admins_username` (`username`);

--
-- Indexes for table `games`
--
ALTER TABLE `games`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subscribers`
--
ALTER TABLE `subscribers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_subscribers_game_id` (`game_id`),
  ADD KEY `idx_subscribers_created_at` (`created_at`);

--
-- Indexes for table `usersmobile`
--
ALTER TABLE `usersmobile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_users_game_id` (`game_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `games`
--
ALTER TABLE `games`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `subscribers`
--
ALTER TABLE `subscribers`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `subscribers`
--
ALTER TABLE `subscribers`
  ADD CONSTRAINT `fk_subscribers_game` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
