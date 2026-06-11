import { Client } from 'pg';

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

    const fs = require('fs');
    const path = require('path');
    const schemaV2Path = path.join(__dirname, '../../schema_v2_admin_enhancements.sql');
    const schemaV2Sql = fs.readFileSync(schemaV2Path, 'utf8');
    
    console.log('Executing schema v2...');
    await client.query(schemaV2Sql);

    console.log('Executing migration v3...');
    await client.query(`
      ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
      ALTER TABLE clinic_settings ADD COLUMN IF NOT EXISTS config_data JSONB DEFAULT '{}'::jsonb;
    `);
    
    console.log('Migration executed successfully!');
  } catch (error) {
    console.error('Error executing migration:', error);
  } finally {
    await client.end();
  }
};

migrate();
