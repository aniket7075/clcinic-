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
  const sql = fs.readFileSync(path.join(__dirname, 'fix-audit-trigger.sql'), 'utf8');
  try {
    await client.query(sql);
    console.log('Trigger fixed successfully.');
  } catch (err) {
    console.error('Error fixing trigger:', err);
  } finally {
    await client.end();
  }
}

runSql();
