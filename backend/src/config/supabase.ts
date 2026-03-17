import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 환경변수에 설정해주세요.');
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
