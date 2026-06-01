-- Add genre and posterUrl columns to Movie table
ALTER TABLE `Movie` ADD COLUMN `genre` VARCHAR(191) NULL;
ALTER TABLE `Movie` ADD COLUMN `posterUrl` VARCHAR(191) NULL;
