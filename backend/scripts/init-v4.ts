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

    const schemaPath = path.join(__dirname, '../../schema_v4_notifications.sql');
    console.log(`Reading schema file from ${schemaPath}...`);
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');
    await client.query(schemaSql);
    
    console.log('Schema executed successfully!');
  } catch (error) {
    console.error('Error executing schema:', error);
  } finally {
    await client.end();
  }
};

initDb();
