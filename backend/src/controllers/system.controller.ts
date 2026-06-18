import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { localDb } from '../config/sqlite';

export const getSystemSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stmt = localDb.prepare('SELECT * FROM system_settings ORDER BY key');
    const rows = stmt.all();
    
    // Parse value strings back to JSON
    const data = rows.map((row: any) => ({
      ...row,
      value: JSON.parse(row.value)
    }));

    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSystemSetting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    const valueStr = JSON.stringify(value);
    const stmt = localDb.prepare(`
      INSERT INTO system_settings (key, value, updated_at) 
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `);
    
    stmt.run(key, valueStr);

    res.status(200).json({ key, value, updated_at: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
