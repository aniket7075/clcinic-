import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

const migrate = async () => {
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

    const schemaPath = path.join(__dirname, '../../schema_phase1.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing schema Phase 1 (Advanced Features)...');
    await client.query(sql);
    
    console.log('Phase 1 Migration executed successfully!');
  } catch (error) {
    console.error('Error executing migration:', error);
  } finally {
    await client.end();
  }
};

migrate();
