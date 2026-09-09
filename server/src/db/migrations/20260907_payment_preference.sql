-- ============================================================================
-- WORKMOJO MIGRATION: Payment Method Preference (Online vs Offline/Cash)
-- Date: 2026-09-07
-- Safe, Non-Destructive & Idempotent
-- ============================================================================

-- 1. Ensure worker_profiles has preferred_payment_method column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'worker_profiles' AND column_name = 'preferred_payment_method'
    ) THEN
        ALTER TABLE worker_profiles ADD COLUMN preferred_payment_method VARCHAR(20) DEFAULT 'ONLINE';
    ELSE
        ALTER TABLE worker_profiles ALTER COLUMN preferred_payment_method SET DEFAULT 'ONLINE';
    END IF;
END $$;

-- 2. Update existing rows if any are NULL or legacy
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

-- 4. Add offline settlement details to payments table
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
