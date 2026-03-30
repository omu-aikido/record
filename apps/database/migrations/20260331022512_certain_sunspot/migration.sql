CREATE TABLE `activity` (
	`id` text PRIMARY KEY,
	`userId` text NOT NULL,
	`date` text NOT NULL,
	`period` real DEFAULT 1.5 NOT NULL,
	`createAt` text DEFAULT 'sql`(CURRENT_TIMESTAMP)`' NOT NULL,
	`updatedAt` text
);
