import { supabase } from '../config/supabase';
import { localDb } from '../config/sqlite';

export class DbService {
  static async insert(tableName: string, data: any) {
    // 1. Write to Supabase (Primary)
    const { data: supabaseData, error } = await supabase
      .from(tableName)
      .insert(Array.isArray(data) ? data : [data])
      .select()
      .single();

    if (error) throw error;

    // 2. Backup to Local SQLite
    try {
      if (supabaseData) {
        const keys = Object.keys(supabaseData);
        const placeholders = keys.map(() => '?').join(', ');
        const values = keys.map(k => {
          // SQLite doesn't support objects, store as JSON strings if needed
          const val = supabaseData[k];
          return (typeof val === 'object' && val !== null) ? JSON.stringify(val) : val;
        });
        localDb.prepare(`INSERT OR REPLACE INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders})`).run(...values);
      }
    } catch (e: any) {
       console.error(`[Local DB Backup Error] Failed to backup insert to ${tableName}:`, e.message);
    }

    return supabaseData;
  }

  static async update(tableName: string, id: string, data: any) {
    // 1. Update in Supabase (Primary)
    const { data: supabaseData, error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // 2. Backup to Local SQLite
    try {
      if (supabaseData) {
        const keys = Object.keys(supabaseData);
        const sets = keys.map(k => `${k} = ?`).join(', ');
        const values = keys.map(k => {
          const val = supabaseData[k];
          return (typeof val === 'object' && val !== null) ? JSON.stringify(val) : val;
        });
        values.push(id);
        localDb.prepare(`UPDATE ${tableName} SET ${sets} WHERE id = ?`).run(...values);
      }
    } catch(e: any) {
      console.error(`[Local DB Backup Error] Failed to backup update to ${tableName}:`, e.message);
    }

    return supabaseData;
  }

  static async delete(tableName: string, id: string) {
    // 1. Delete in Supabase
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw error;

    // 2. Delete from Local SQLite
    try {
      localDb.prepare(`DELETE FROM ${tableName} WHERE id = ?`).run(id);
    } catch(e: any) {
      console.error(`[Local DB Backup Error] Failed to backup delete from ${tableName}:`, e.message);
    }

    return true;
  }
}
