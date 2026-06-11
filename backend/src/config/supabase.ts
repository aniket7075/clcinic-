import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || ''; // Use service key for admin access from backend

if (!supabaseUrl || !supabaseKey) {
  console.warn('Missing Supabase URL or Service Key. Database features will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
