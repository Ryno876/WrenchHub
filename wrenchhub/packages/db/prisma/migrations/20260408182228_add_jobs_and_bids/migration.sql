-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "sub_category" TEXT,
    "photos" TEXT[],
    "service_type_preference" TEXT NOT NULL DEFAULT 'no_preference',
    "urgency" TEXT NOT NULL DEFAULT 'flexible',
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bids" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "mechanic_id" TEXT NOT NULL,
    "mechanic_profile_id" TEXT NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "parts_breakdown" TEXT NOT NULL,
    "labor_hours" DOUBLE PRECISION NOT NULL,
    "labor_rate" DOUBLE PRECISION NOT NULL,
    "fees" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimated_completion_time" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "availability" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bids_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bids_job_id_mechanic_id_key" ON "bids"("job_id", "mechanic_id");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_mechanic_id_fkey" FOREIGN KEY ("mechanic_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_mechanic_profile_id_fkey" FOREIGN KEY ("mechanic_profile_id") REFERENCES "mechanic_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
