import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Service Role Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, '../../schema_v10_feature_access.sql');
    const sqlQuery = fs.readFileSync(sqlPath, 'utf8');

    // To run raw SQL from the JS client, we must use a Postgres function or RPC.
    // Wait, the previous migrations were applied using a trick or manual execution in Supabase Dashboard.
    // Let me check if there is an RPC 'exec_sql' available.
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlQuery });

    if (error) {
       console.error('RPC Error. You may need to run this manually in the Supabase SQL editor:', error);
    } else {
       console.log('Migration completed successfully.');
    }
  } catch (err) {
    console.error('Error reading/executing migration:', err);
  }
}

runMigration();
