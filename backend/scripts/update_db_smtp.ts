import { Client } from 'pg';

const client = new Client({
  user: 'postgres.hrneivdsbdcihkczqnaw',
  password: 'Aniket%7075',
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

client.connect().then(() => {
  const query = `
    UPDATE system_settings 
    SET value = '{"host": "smtp.gmail.com", "port": 587, "secure": false, "user": "qdentsoftware@gmail.com", "pass": "qbrjkbikkknszumd", "senderName": "Q Dent Admin"}'::jsonb 
    WHERE key = 'smtp_config'
  `;
  return client.query(query);
}).then(() => {
  console.log('Database updated!');
}).catch(console.error).finally(() => {
  client.end();
});
