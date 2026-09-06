-- ============================================================================
-- WORK MOJO — Cooperative Gig Services Platform
-- Smart India Hackathon 2026 | Problem Statement SIH26089
-- PostgreSQL / Supabase Relational Database Schema (16 Tables)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'worker' CHECK (role IN ('worker', 'customer', 'both', 'admin')),
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(20) DEFAULT 'Not Specified',
    kyc_verified BOOLEAN DEFAULT FALSE,
    profile_photo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. WORKER PROFILES TABLE
CREATE TABLE IF NOT EXISTS worker_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    skills TEXT[] DEFAULT '{}',
    categories TEXT[] DEFAULT '{}',
    experience_jobs INT DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 5.00,
    reliability_score INT DEFAULT 100 CHECK (reliability_score BETWEEN 0 AND 100),
    min_daily_wage NUMERIC(10,2) DEFAULT 500.00,
    availability VARCHAR(20) DEFAULT 'Available' CHECK (availability IN ('Available', 'Busy', 'Away')),
    approx_lat NUMERIC(9,6),
    approx_lng NUMERIC(9,6),
    approx_area VARCHAR(150),
    preferred_payment_method VARCHAR(20) DEFAULT 'UPI',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EMPLOYER PROFILES TABLE
CREATE TABLE IF NOT EXISTS employer_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(150),
    rating NUMERIC(3,2) DEFAULT 5.00,
    jobs_posted_count INT DEFAULT 0,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WORKER BANK DETAILS (Masked in UI)
CREATE TABLE IF NOT EXISTS worker_bank_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_holder_name VARCHAR(100) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_number_masked VARCHAR(30) NOT NULL, -- e.g. "•••• •••• 4589"
    ifsc_code VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. WORKER UPI DETAILS
CREATE TABLE IF NOT EXISTS worker_upi_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    upi_id_masked VARCHAR(100) NOT NULL, -- e.g. "arun••••@oksbi"
    qr_image_url TEXT,
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. JOBS TABLE
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    wage NUMERIC(10,2) NOT NULL,
    start_time VARCHAR(50) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    urgency VARCHAR(30) DEFAULT 'Today' CHECK (urgency IN ('Today', 'Tomorrow', 'Scheduled')),
    workers_required INT NOT NULL DEFAULT 1,
    workers_confirmed INT NOT NULL DEFAULT 0,
    approximate_area VARCHAR(150) NOT NULL,
    approximate_distance_km NUMERIC(5,2) DEFAULT 2.5,
    exact_address TEXT NOT NULL,
    landmark VARCHAR(150),
    exact_lat NUMERIC(9,6),
    exact_lng NUMERIC(9,6),
    status VARCHAR(30) DEFAULT 'Open' CHECK (status IN ('Open', 'Filled', 'Ongoing', 'Finished', 'Cancelled')),
    recurring VARCHAR(20) DEFAULT 'none' CHECK (recurring IN ('none', 'daily', 'weekly', 'monthly')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'applied' CHECK (status IN ('applied', 'confirmed', 'waiting_list', 'rejected', 'cancelled')),
    match_score INT DEFAULT 85,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, worker_id)
);

-- 8. JOB WORKERS TABLE (Confirmed slots)
CREATE TABLE IF NOT EXISTS job_workers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'ongoing', 'completed', 'cancelled')),
    confirmed_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(job_id, worker_id)
);

-- 9. WAITING LIST TABLE (FIFO Queue)
CREATE TABLE IF NOT EXISTS waiting_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    position INT NOT NULL,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, worker_id)
);

-- 10. ATTENDANCE TABLE (QR Check-in & Check-out)
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    qr_token VARCHAR(100) NOT NULL,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    check_in_lat NUMERIC(9,6),
    check_in_lng NUMERIC(9,6),
    geofence_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CHECKED_IN', 'CHECKED_OUT', 'ABSENT', 'FLAGGED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_id, worker_id)
);

-- 11. PAYMENTS TABLE (Protected Payment Workflow)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    platform_fee NUMERIC(10,2) DEFAULT 0.00, -- Cooperative Zero Fee
    total_amount NUMERIC(10,2) NOT NULL,
    method VARCHAR(30) DEFAULT 'UPI' CHECK (method IN ('UPI', 'CASH', 'DIRECT_TRANSFER')),
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'AUTHORIZED', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED', 'DISPUTED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PAYMENT TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    transaction_ref VARCHAR(100) UNIQUE NOT NULL, -- e.g. "WM-TXN-20260903-8742"
    utr_number VARCHAR(100),                      -- e.g. "UPI-428901239841"
    gateway_status VARCHAR(50) DEFAULT 'SUCCESS',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 13. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(40) NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    deep_link_screen VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. RATINGS & REVIEWS TABLE
CREATE TABLE IF NOT EXISTS ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating NUMERIC(2,1) NOT NULL CHECK (rating BETWEEN 1.0 AND 5.0),
    review_text TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. REPORTS & DISPUTES TABLE
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    reported_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    details TEXT,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. BLOCKED USERS TABLE
CREATE TABLE IF NOT EXISTS blocked_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, blocked_user_id)
);

-- ============================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_employer ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_worker ON applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_job_workers_job ON job_workers(job_id);
CREATE INDEX IF NOT EXISTS idx_waiting_list_job ON waiting_list(job_id, position);
CREATE INDEX IF NOT EXISTS idx_attendance_job ON attendance(job_id);
CREATE INDEX IF NOT EXISTS idx_payments_job ON payments(job_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_user_id, read);
