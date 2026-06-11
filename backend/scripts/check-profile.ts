import { Client } from 'pg';

async function checkProfile() {
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
    const res = await client.query('SELECT * FROM public.profiles');
    console.log('Profiles:', res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkProfile();
