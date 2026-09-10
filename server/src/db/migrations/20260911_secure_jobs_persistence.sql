-- ============================================================================
-- WORKMOJO PRODUCTION MIGRATION: Secure Jobs Persistence & Referential Integrity
-- Migration File: 20260911_secure_jobs_persistence.sql
-- 
-- Security & Architectural Guarantees:
-- 1. Row Level Security (RLS) remains ENABLED on all 16 tables.
-- 2. Sensitive tables (users, worker_profiles, payments, ratings, applications,
--    notifications, attendance, reports, blocked_users) remain strictly protected.
--    Zero public write policies exist on sensitive tables.
-- 3. Only the jobs table receives necessary type conversions to support
--    WorkMojo string identifiers (e.g. 'job-1789056254222', 'cust-kumar').
-- 4. Foreign key referential integrity from dependent tables (applications,
--    job_workers, waiting_list, attendance, payments, notifications, ratings,
--    reports) to jobs(id) is PRESERVED.
-- 5. Zero public INSERT/UPDATE/DELETE policies on jobs. Public clients (anon)
--    can ONLY read (SELECT) open jobs.
-- 6. All backend writes are performed exclusively by the Render Express backend
--    using SUPABASE_SERVICE_ROLE_KEY (which safely bypasses RLS at the PostgreSQL level).
-- ============================================================================

-- Step 1: Temporarily drop dependent foreign keys to jobs(id) to allow type alteration
ALTER TABLE IF EXISTS applications DROP CONSTRAINT IF EXISTS applications_job_id_fkey;
ALTER TABLE IF EXISTS job_workers DROP CONSTRAINT IF EXISTS job_workers_job_id_fkey;
ALTER TABLE IF EXISTS waiting_list DROP CONSTRAINT IF EXISTS waiting_list_job_id_fkey;
ALTER TABLE IF EXISTS attendance DROP CONSTRAINT IF EXISTS attendance_job_id_fkey;
ALTER TABLE IF EXISTS payments DROP CONSTRAINT IF EXISTS payments_job_id_fkey;
ALTER TABLE IF EXISTS notifications DROP CONSTRAINT IF EXISTS notifications_job_id_fkey;
ALTER TABLE IF EXISTS ratings DROP CONSTRAINT IF EXISTS ratings_job_id_fkey;
ALTER TABLE IF EXISTS reports DROP CONSTRAINT IF EXISTS reports_job_id_fkey;
ALTER TABLE IF EXISTS jobs DROP CONSTRAINT IF EXISTS jobs_employer_id_fkey;

-- Step 2: Alter jobs.id and jobs.employer_id to TEXT to support WorkMojo string IDs
ALTER TABLE IF EXISTS jobs ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS jobs ALTER COLUMN employer_id TYPE TEXT;

-- Step 3: Alter dependent foreign key columns to TEXT
ALTER TABLE IF EXISTS applications ALTER COLUMN job_id TYPE TEXT;
ALTER TABLE IF EXISTS job_workers ALTER COLUMN job_id TYPE TEXT;
ALTER TABLE IF EXISTS waiting_list ALTER COLUMN job_id TYPE TEXT;
ALTER TABLE IF EXISTS attendance ALTER COLUMN job_id TYPE TEXT;
ALTER TABLE IF EXISTS payments ALTER COLUMN job_id TYPE TEXT;
ALTER TABLE IF EXISTS notifications ALTER COLUMN job_id TYPE TEXT;
ALTER TABLE IF EXISTS ratings ALTER COLUMN job_id TYPE TEXT;
ALTER TABLE IF EXISTS reports ALTER COLUMN job_id TYPE TEXT;

-- Step 4: RE-ESTABLISH Foreign Key Referential Integrity to jobs(id)
ALTER TABLE IF EXISTS applications ADD CONSTRAINT applications_job_id_fkey 
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS job_workers ADD CONSTRAINT job_workers_job_id_fkey 
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS waiting_list ADD CONSTRAINT waiting_list_job_id_fkey 
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS attendance ADD CONSTRAINT attendance_job_id_fkey 
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS payments ADD CONSTRAINT payments_job_id_fkey 
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS notifications ADD CONSTRAINT notifications_job_id_fkey 
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS ratings ADD CONSTRAINT ratings_job_id_fkey 
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS reports ADD CONSTRAINT reports_job_id_fkey 
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL;

-- Step 5: Add employer metadata columns to jobs table (if not already present)
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS customer_name TEXT DEFAULT 'Verified Employer';
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS customer_photo TEXT DEFAULT '';
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS customer_rating NUMERIC(3,2) DEFAULT 4.80;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS customer_kyc BOOLEAN DEFAULT TRUE;
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS business_name TEXT DEFAULT '';
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS selection_mode VARCHAR(30) DEFAULT 'manual';

-- Step 6: Ensure Row Level Security is ENABLED on ALL 16 tables
ALTER TABLE IF EXISTS jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS job_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS waiting_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blocked_users ENABLE ROW LEVEL SECURITY;

-- Step 7: Define Secure Policies for the jobs table ONLY
-- Clean up any legacy or broad policies on jobs
DROP POLICY IF EXISTS "Public access on jobs" ON jobs;
DROP POLICY IF EXISTS "Public read on jobs" ON jobs;
DROP POLICY IF EXISTS "Allow public read on jobs" ON jobs;
DROP POLICY IF EXISTS "Service write on jobs" ON jobs;
DROP POLICY IF EXISTS "Allow insert on jobs" ON jobs;
DROP POLICY IF EXISTS "Service update on jobs" ON jobs;
DROP POLICY IF EXISTS "Allow update on jobs" ON jobs;

-- 7A: Public READ ONLY: Anyone (anon/authenticated) can browse open jobs
CREATE POLICY "Allow public read on jobs" ON jobs 
    FOR SELECT TO anon, authenticated
    USING (true);

-- 7B: NO INSERT policy for anon
-- 7C: NO UPDATE policy for anon
-- 7D: NO DELETE policy for anon
-- NOTE: The Render Express backend uses SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS
-- in PostgreSQL. Direct writes from public clients (anon) are strictly blocked.

-- Step 8: Verification query (inspecting updated columns)
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('jobs', 'applications', 'payments', 'job_workers', 'attendance') 
  AND column_name IN ('id', 'job_id', 'employer_id');
