-- CreateTable
CREATE TABLE "users" (
    "uid" UUID NOT NULL,
    "first_name" VARCHAR(40) NOT NULL,
    "last_name" VARCHAR(40) NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "email" VARCHAR(40) NOT NULL,
    "password" VARCHAR(225) NOT NULL,
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "icon_url" TEXT,
    "remember_token" VARCHAR(225),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "drafts" (
    "uid" UUID NOT NULL,
    "user_uid" UUID NOT NULL,
    "campaign_name" VARCHAR(20) NOT NULL,
    "section" VARCHAR(40) NOT NULL,
    "title" VARCHAR(40) NOT NULL,
    "message" VARCHAR(250) NOT NULL,
    "last_modified" TIMESTAMP(6) NOT NULL,
    "target_user" VARCHAR(40) NOT NULL,
    "device" VARCHAR(40) NOT NULL,
    "recipient_type" VARCHAR(40) NOT NULL,
    "upload_image" VARCHAR(255) NOT NULL,
    "upload_file" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "drafts_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "campaign_schedules" (
    "uid" UUID NOT NULL,
    "user_uid" UUID NOT NULL,
    "draft_uid" UUID NOT NULL,
    "type" VARCHAR(40) NOT NULL,
    "datetime_send" TIMESTAMP(6) NOT NULL,
    "status" VARCHAR(45) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "campaign_schedules_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "campaign_reports" (
    "uid" UUID NOT NULL,
    "user_uid" UUID NOT NULL,
    "title" VARCHAR(40) NOT NULL,
    "message" VARCHAR(250) NOT NULL,
    "schedule" VARCHAR(40) NOT NULL,
    "target_user" VARCHAR(40) NOT NULL,
    "delivery_schedules" TIMESTAMP(6) NOT NULL,
    "device" VARCHAR(40) NOT NULL,
    "players" VARCHAR(45) NOT NULL,
    "status" VARCHAR(45) NOT NULL,
    "credit_usage" VARCHAR(45) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "campaign_reports_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "subscribers" (
    "uid" UUID NOT NULL,
    "user_uid" UUID NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "is_subscribe" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "subscribers_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "user_password_reset" (
    "uid" UUID NOT NULL,
    "user_uid" UUID NOT NULL,
    "email" VARCHAR(40) NOT NULL,
    "token" VARCHAR(225) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_password_reset_pkey" PRIMARY KEY ("uid")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_uid_key" ON "users"("uid");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_uid_idx" ON "users"("uid");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "drafts_uid_key" ON "drafts"("uid");

-- CreateIndex
CREATE INDEX "drafts_uid_idx" ON "drafts"("uid");

-- CreateIndex
CREATE INDEX "drafts_user_uid_idx" ON "drafts"("user_uid");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_schedules_uid_key" ON "campaign_schedules"("uid");

-- CreateIndex
CREATE INDEX "campaign_schedules_uid_idx" ON "campaign_schedules"("uid");

-- CreateIndex
CREATE INDEX "campaign_schedules_user_uid_idx" ON "campaign_schedules"("user_uid");

-- CreateIndex
CREATE INDEX "campaign_schedules_draft_uid_idx" ON "campaign_schedules"("draft_uid");

-- CreateIndex
CREATE UNIQUE INDEX "campaign_reports_uid_key" ON "campaign_reports"("uid");

-- CreateIndex
CREATE INDEX "campaign_reports_uid_idx" ON "campaign_reports"("uid");

-- CreateIndex
CREATE INDEX "campaign_reports_user_uid_idx" ON "campaign_reports"("user_uid");

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_uid_key" ON "subscribers"("uid");

-- CreateIndex
CREATE INDEX "subscribers_uid_idx" ON "subscribers"("uid");

-- CreateIndex
CREATE INDEX "subscribers_user_uid_idx" ON "subscribers"("user_uid");

-- CreateIndex
CREATE UNIQUE INDEX "user_password_reset_uid_key" ON "user_password_reset"("uid");

-- CreateIndex
CREATE INDEX "user_password_reset_uid_idx" ON "user_password_reset"("uid");

-- CreateIndex
CREATE INDEX "user_password_reset_email_idx" ON "user_password_reset"("email");

-- AddForeignKey
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "users"("uid") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "campaign_schedules" ADD CONSTRAINT "campaign_schedules_draft_uid_fkey" FOREIGN KEY ("draft_uid") REFERENCES "drafts"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_schedules" ADD CONSTRAINT "campaign_schedules_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "users"("uid") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "campaign_reports" ADD CONSTRAINT "campaign_reports_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "users"("uid") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "subscribers" ADD CONSTRAINT "subscribers_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "users"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_password_reset" ADD CONSTRAINT "user_password_reset_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "users"("uid") ON DELETE RESTRICT ON UPDATE RESTRICT;
