import { supabase } from './src/config/supabase';
import * as dotenv from 'dotenv';
dotenv.config();

async function getSwagger() {
  const url = process.env.SUPABASE_URL + '/rest/v1/?apikey=' + process.env.SUPABASE_SERVICE_KEY;
  const res = await fetch(url);
  const json = await res.json();
  const inventoryDef = json.definitions.inventory.properties;
  console.log('Inventory columns:', Object.keys(inventoryDef));
}

getSwagger();
