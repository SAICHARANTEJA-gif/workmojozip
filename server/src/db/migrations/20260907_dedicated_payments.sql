-- ============================================================================
-- WORKMOJO MIGRATION: Dedicated Payments Section Schema Enhancements
-- Date: 2026-09-07
-- Safe, Non-Destructive & Idempotent for Supabase PostgreSQL
-- ============================================================================

-- 1. Ensure worker_profiles has preferred_payment_method
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'worker_profiles' AND column_name = 'preferred_payment_method'
    ) THEN
        ALTER TABLE worker_profiles ADD COLUMN preferred_payment_method VARCHAR(20) DEFAULT 'ONLINE';
    END IF;
END $$;

-- 2. Update existing rows if any are NULL
UPDATE worker_profiles 
SET preferred_payment_method = 'ONLINE' 
WHERE preferred_payment_method IS NULL;

-- 3. Expand payments table method CHECK constraint to include ONLINE & OFFLINE
DO $$
BEGIN
    ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_method_check;
    ALTER TABLE payments ADD CONSTRAINT payments_method_check 
        CHECK (method IN ('UPI', 'CASH', 'DIRECT_TRANSFER', 'ONLINE', 'OFFLINE'));
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- 4. Expand payments table status CHECK constraint to include COMPLETED
DO $$
BEGIN
    ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
    ALTER TABLE payments ADD CONSTRAINT payments_status_check 
        CHECK (status IN ('PENDING', 'AUTHORIZED', 'PROCESSING', 'PAID', 'COMPLETED', 'FAILED', 'REFUNDED', 'DISPUTED'));
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- 5. Add offline settlement details and payment_preference to payments table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'offline_notes'
    ) THEN
        ALTER TABLE payments ADD COLUMN offline_notes TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'offline_settled_at'
    ) THEN
        ALTER TABLE payments ADD COLUMN offline_settled_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'payment_preference'
    ) THEN
        ALTER TABLE payments ADD COLUMN payment_preference VARCHAR(20) DEFAULT 'ONLINE';
    END IF;
END $$;

-- 6. Add performance indexes for worker and employer payment lookups
CREATE INDEX IF NOT EXISTS idx_payments_worker_id ON payments(worker_id);
CREATE INDEX IF NOT EXISTS idx_payments_employer_id ON payments(employer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

