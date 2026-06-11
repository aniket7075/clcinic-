import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

const initDb = async () => {
  console.log('Connecting to database...');
  const client = new Client({
    user: 'postgres.hrneivdsbdcihkczqnaw',
    password: 'Aniket%7075',
    host: 'aws-1-ap-south-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected successfully!');

    console.log('Executing enum alter...');
    await client.query("ALTER TYPE tooth_status ADD VALUE IF NOT EXISTS 'UNHEALTHY';");
    await client.query("ALTER TYPE tooth_status ADD VALUE IF NOT EXISTS 'DECAYED';");
    await client.query("ALTER TYPE tooth_status ADD VALUE IF NOT EXISTS 'FILLED';");
    
    console.log('Enum altered successfully!');
  } catch (error) {
    console.error('Error executing schema:', error);
  } finally {
    await client.end();
  }
};

initDb();
