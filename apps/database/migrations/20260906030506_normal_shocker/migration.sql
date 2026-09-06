PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_activity` (
	`id` text PRIMARY KEY,
	`userId` text NOT NULL,
	`date` text NOT NULL,
	`period` real DEFAULT 1.5 NOT NULL,
	`createAt` text NOT NULL,
	`updatedAt` text
);
--> statement-breakpoint
INSERT INTO `__new_activity`(`id`, `userId`, `date`, `period`, `createAt`, `updatedAt`) SELECT `id`, `userId`, `date`, `period`, `createAt`, `updatedAt` FROM `activity`;--> statement-breakpoint
DROP TABLE `activity`;--> statement-breakpoint
ALTER TABLE `__new_activity` RENAME TO `activity`;--> statement-breakpoint
PRAGMA foreign_keys=ON;