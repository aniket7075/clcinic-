import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedAdmin() {
  const email = 'admin@clinic.com';
  const password = 'password123';

  console.log(`Creating user ${email}...`);

  try {
    // 1. Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log('User already exists in auth.users.');
      } else {
        throw authError;
      }
    } else {
      console.log('User created in auth.users successfully.');
      
      // 2. We need to create the profile since there might not be a trigger for it or we need to update the role to SUPER_ADMIN
      const userId = authData.user.id;
      
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
        console.log('Admin profile created successfully.');
      } catch (err) {
        throw err;
      } finally {
        await client.end();
      }
    }

    console.log('\n--- Credentials ---');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('-------------------\n');

  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
}

seedAdmin();
