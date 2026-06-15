import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  try {
    const sqlPath = path.join(__dirname, '../../schema_phase2.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log("Executing Phase 2 Schema...");
    
    // In Supabase, if pgcrypto is already enabled, we can just run queries directly.
    // However, the JS client doesn't have a direct 'exec' for raw SQL unless it's an RPC.
    // We will assume the user has the 'exec_sql' RPC or we will just instruct them if it fails.
    
    const { error } = await supabase.rpc('exec_sql', { sql_string: sql });
    
    if (error) {
      console.error("Migration via RPC failed. If you don't have exec_sql RPC, please run schema_phase2.sql manually in Supabase SQL editor.");
      console.error("Error details:", error);
    } else {
      console.log("Migration successful!");
    }
  } catch (err) {
    console.error("Migration error:", err);
  }
}

migrate();
