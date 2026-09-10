-- ============================================================================
-- WORKMOJO PRODUCTION MIGRATION: Secure Applications Persistence
-- Migration File: 20260912_secure_applications_persistence.sql
-- 
-- Architectural Guarantees:
-- 1. Row Level Security (RLS) remains strictly ENABLED on applications table.
-- 2. ZERO public anon SELECT/INSERT/UPDATE/DELETE policies are granted on applications.
-- 3. Applications data is accessible exclusively through the trusted Express backend
--    using SUPABASE_SERVICE_ROLE_KEY (which safely bypasses RLS).
-- 4. applications.id, applications.job_id, and applications.worker_id are converted
--    to TEXT to support WorkMojo string identifiers (e.g. 'job-174123456', 'worker-me', 'w1').
-- 5. Referential integrity to jobs(id) ON DELETE CASCADE is preserved.
-- 6. The invalid FK applications.worker_id -> users.id is removed because the prototype
--    uses string worker IDs while users.id remains UUID.
-- 7. Composite unique constraint UNIQUE(job_id, worker_id) is enforced for duplicate protection.
-- ============================================================================

-- Step 1: Temporarily drop dependent foreign keys and unique constraints on applications
ALTER TABLE IF EXISTS applications DROP CONSTRAINT IF EXISTS applications_job_id_fkey;
ALTER TABLE IF EXISTS applications DROP CONSTRAINT IF EXISTS applications_worker_id_fkey;
ALTER TABLE IF EXISTS applications DROP CONSTRAINT IF EXISTS applications_job_id_worker_id_key;

-- Step 2: Convert ID columns to TEXT
ALTER TABLE IF EXISTS applications ALTER COLUMN id TYPE TEXT;
ALTER TABLE IF EXISTS applications ALTER COLUMN job_id TYPE TEXT;
ALTER TABLE IF EXISTS applications ALTER COLUMN worker_id TYPE TEXT;

-- Step 3: Re-establish Foreign Key to jobs(id) ON DELETE CASCADE
-- (Both applications.job_id and jobs.id are TEXT)
ALTER TABLE IF EXISTS applications 
    ADD CONSTRAINT applications_job_id_fkey 
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;

-- Step 4: Re-establish Unique Constraint on (job_id, worker_id)
ALTER TABLE IF EXISTS applications 
    ADD CONSTRAINT applications_job_id_worker_id_key 
    UNIQUE (job_id, worker_id);

-- Step 5: Add applicant profile metadata columns (if not already present)
ALTER TABLE IF EXISTS applications ADD COLUMN IF NOT EXISTS worker_name TEXT DEFAULT 'Verified Worker';
ALTER TABLE IF EXISTS applications ADD COLUMN IF NOT EXISTS worker_phone TEXT DEFAULT '';
ALTER TABLE IF EXISTS applications ADD COLUMN IF NOT EXISTS worker_photo TEXT DEFAULT '';
ALTER TABLE IF EXISTS applications ADD COLUMN IF NOT EXISTS worker_rating NUMERIC(3,2) DEFAULT 4.80;
ALTER TABLE IF EXISTS applications ADD COLUMN IF NOT EXISTS worker_reliability INT DEFAULT 95;
ALTER TABLE IF EXISTS applications ADD COLUMN IF NOT EXISTS worker_skills TEXT[] DEFAULT '{}';

-- Step 6: Create performance index on job_id for rapid applicant retrieval
CREATE INDEX IF NOT EXISTS idx_applications_job_id_created 
    ON applications(job_id, created_at DESC);

-- Step 7: Ensure Row Level Security remains strictly ENABLED
ALTER TABLE IF EXISTS applications ENABLE ROW LEVEL SECURITY;

-- Step 8: Drop all public / anon policies (zero public access to applications)
DROP POLICY IF EXISTS "Public can view applications" ON applications;
DROP POLICY IF EXISTS "Public can insert applications" ON applications;
DROP POLICY IF EXISTS "Public can update applications" ON applications;
DROP POLICY IF EXISTS "Public can delete applications" ON applications;
DROP POLICY IF EXISTS "Allow anon read applications" ON applications;
DROP POLICY IF EXISTS "Allow anon write applications" ON applications;
DROP POLICY IF EXISTS "Allow public read applications" ON applications;
DROP POLICY IF EXISTS "Allow public write applications" ON applications;

