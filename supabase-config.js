require('dotenv').config();

module.exports = {
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_TABLE: process.env.SUPABASE_TABLE || 'app_data',
  SUPABASE_ROW_ID: parseInt(process.env.SUPABASE_ROW_ID, 10) || 1
};
