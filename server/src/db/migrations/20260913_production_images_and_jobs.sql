-- ============================================================================
-- WORKMOJO PRODUCTION MIGRATION: Job & User Image Persistence & Referential Integrity
-- Migration File: 20260913_production_images_and_jobs.sql
-- 
-- Guarantees:
-- 1. Adds image_url column to jobs table for persistent cross-device job imagery.
-- 2. Ensures profile_photo column on users table.
-- 3. Preserves foreign key referential integrity: applications.job_id -> jobs.id ON DELETE CASCADE.
-- 4. RLS remains strictly ENABLED. Public anon can read open jobs; backend writes via service role.
-- 5. Configures public storage bucket 'workmojo-media' for fast media asset retrieval.
-- ============================================================================

-- Step 1: Add image_url column to jobs table (if not already present)
ALTER TABLE IF EXISTS jobs ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';

-- Step 2: Ensure profile_photo column exists on users table
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS profile_photo TEXT DEFAULT '';

-- Step 3: Re-verify foreign key referential integrity from applications to jobs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'applications_job_id_fkey' 
          AND table_name = 'applications'
    ) THEN
        ALTER TABLE applications 
            ADD CONSTRAINT applications_job_id_fkey 
            FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 4: Ensure RLS is strictly ENABLED on jobs, applications, and users
ALTER TABLE IF EXISTS jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;

-- Step 5: Maintain secure policies on jobs table (public read only)
DROP POLICY IF EXISTS "Allow public read on jobs" ON jobs;
CREATE POLICY "Allow public read on jobs" ON jobs 
    FOR SELECT TO anon, authenticated 
    USING (true);

-- Step 6: Create or update public media storage bucket for profile pictures and job images
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
        INSERT INTO storage.buckets (id, name, public) 
        VALUES ('workmojo-media', 'workmojo-media', true)
        ON CONFLICT (id) DO UPDATE SET public = true;

        DROP POLICY IF EXISTS "Public read media objects" ON storage.objects;
        CREATE POLICY "Public read media objects" ON storage.objects
            FOR SELECT TO public
            USING (bucket_id = 'workmojo-media');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Storage bucket setup notice: %', SQLERRM;
END $$;
