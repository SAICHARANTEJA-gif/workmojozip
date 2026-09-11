import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://demo-placeholder.supabase.co';
// Prefer SERVICE_ROLE_KEY in backend environment to bypass RLS; fallback to ANON_KEY
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'demo-anon-key';

export const isSupabaseConfigured = (): boolean => {
  return (
    !!process.env.SUPABASE_URL &&
    !process.env.SUPABASE_URL.includes('demo-placeholder') &&
    !!SUPABASE_KEY &&
    SUPABASE_KEY !== 'demo-anon-key'
  );
};

export const isServiceRoleActive = (): boolean => {
  return (
    !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== 'demo-anon-key'
  );
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

export const STORAGE_BUCKET = 'workmojo-media';

export const ensureMediaBucketExists = async (): Promise<boolean> => {
  if (!isSupabaseConfigured()) return false;
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = Array.isArray(buckets) && buckets.some(b => b.name === STORAGE_BUCKET);
    if (!exists) {
      const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, { public: true });
      if (error) {
        console.warn('[Supabase/Storage] Bucket creation notice:', error.message);
        return false;
      }
      console.log(`[Supabase/Storage] Created public bucket "${STORAGE_BUCKET}" successfully.`);
    }
    return true;
  } catch (err: any) {
    console.warn('[Supabase/Storage] Warning checking storage buckets:', err.message);
    return false;
  }
};
