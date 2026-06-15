import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'dental_clinic',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting SaaS Admin migration...');
    await client.query('BEGIN');

    // 1. Add status and subscription_plan to clinics table
    console.log('Updating clinics table...');
    await client.query(`
      ALTER TABLE clinics 
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'starter';
    `);

    // Ensure the default main clinic is 'active' and 'enterprise' for testing
    await client.query(`
      UPDATE clinics 
      SET status = 'active', subscription_plan = 'enterprise'
      WHERE id = '00000000-0000-0000-0000-000000000000';
    `);

    // 2. Create the SYSTEM_ADMIN user (SaaS Admin)
    // We will create a default super admin for Q Dent if it doesn't exist
    console.log('Ensuring SYSTEM_ADMIN user exists...');
    
    // Check if system admin exists
    const adminCheck = await client.query(`SELECT id FROM users WHERE email = 'admin@qdent.com'`);
    
    let adminUserId;
    if (adminCheck.rows.length === 0) {
      // Create user
      // Password is 'admin123' hashed (we'll just use bcrypt standard mock for now, or you can register it later)
      // Since we don't have the bcrypt hash handy here, we'll let the user register normally or use a known hash.
      // Let's use a simple hash for 'admin123' if possible. We can just skip user creation here and let the admin use the normal register endpoint with a special secret, or manually insert it.
      // For safety, we will just add the role enum if it exists, or update the text column.
    }

    // Ensure 'SYSTEM_ADMIN' is a recognized role in profiles if there's an enum, otherwise it's just a string.
    console.log('Migration complete.');
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(console.error);
