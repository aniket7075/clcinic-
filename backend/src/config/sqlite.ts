import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database file will be created in backend/data/clinic.db
const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'clinic.db');

export const localDb = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
localDb.pragma('foreign_keys = ON');

export function initLocalDb() {
  // Create schema
  // Profiles
  localDb.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL DEFAULT 'RECEPTIONIST',
      first_name TEXT,
      last_name TEXT,
      mobile TEXT,
      email TEXT UNIQUE NOT NULL,
      clinic_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Patients
  localDb.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      clinic_id TEXT NOT NULL,
      case_number TEXT UNIQUE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      alternate_mobile TEXT,
      email TEXT,
      gender TEXT,
      dob TEXT,
      age INTEGER,
      blood_group TEXT,
      occupation TEXT,
      address TEXT,
      emergency_contact TEXT,
      photo_url TEXT,
      registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Appointments
  localDb.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      clinic_id TEXT NOT NULL,
      patient_id TEXT NOT NULL,
      doctor_id TEXT,
      appointment_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      status TEXT DEFAULT 'SCHEDULED',
      treatment_type TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
      FOREIGN KEY (doctor_id) REFERENCES profiles(id) ON DELETE SET NULL
    );
  `);

  // Sync Queue
  localDb.exec(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_name TEXT NOT NULL,
      operation TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
      record_id TEXT NOT NULL,
      payload TEXT, -- JSON string representation of the data
      status TEXT DEFAULT 'PENDING', -- 'PENDING', 'SYNCED', 'FAILED'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
