CREATE TABLE `feedback` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`content` text NOT NULL,
	`email` text,
	`status` text DEFAULT 'pending',
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
