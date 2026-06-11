import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function grantPrivileges() {
  const client = new Client({
    user: 'postgres.hrneivdsbdcihkczqnaw',
    password: 'Aniket%7075',
    host: 'aws-1-ap-south-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  try {
    console.log('Granting privileges...');
    
    // Grant usage on schema
    await client.query('GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;');
    
    // Grant all privileges on all tables
    await client.query('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;');
    
    // Grant all privileges on all sequences
    await client.query('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;');
    
    // Grant privileges for future tables and sequences
    await client.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;');
    await client.query('ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;');
    
    console.log('Privileges granted successfully!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

grantPrivileges();
