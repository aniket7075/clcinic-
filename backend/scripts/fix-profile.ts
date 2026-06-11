import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixProfile() {
  const email = 'admin@clinic.com';
  
  const { data, error } = await supabase.auth.admin.listUsers();
  const user = data.users.find(u => u.email === email);
  
  if (!user) {
    console.log('User not found in auth.users');
    return;
  }
  
  const userId = user.id;
  
  const { Client } = require('pg');
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
    await client.query(
      'INSERT INTO public.profiles (id, role, first_name, last_name, email) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role',
      [userId, 'SUPER_ADMIN', 'System', 'Admin', email]
    );
    console.log('Admin profile created successfully!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

fixProfile();
