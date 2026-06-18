import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new Client({
  user: 'postgres.hrneivdsbdcihkczqnaw',
  password: 'Aniket%7075',
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function runSql() {
  await client.connect();
  const sql = fs.readFileSync(path.join(__dirname, '../../schema_v12_system_settings.sql'), 'utf8');
  try {
    await client.query(sql);
    console.log('Migration v12 applied successfully.');
  } catch (err) {
    console.error('Error applying migration:', err);
  } finally {
    await client.end();
  }
}

runSql();
