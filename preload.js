const { contextBridge, ipcRenderer } = require('electron');
const { createClient } = require('@supabase/supabase-js');
const {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_TABLE,
  SUPABASE_ROW_ID
} = require('./supabase-config');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchAppData() {
  const { data, error } = await supabase
    .from(SUPABASE_TABLE)
    .select('data')
    .eq('id', SUPABASE_ROW_ID)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data ? data.data : null;
}

async function saveAppData(payload) {
  const { error } = await supabase.from(SUPABASE_TABLE).upsert(
    { id: SUPABASE_ROW_ID, data: payload },
    { returning: 'minimal' }
  );

  if (error) {
    throw error;
  }
}

contextBridge.exposeInMainWorld('electronAPI', {
  exportToExcel: (data, filename) => ipcRenderer.invoke('export-to-excel', data, filename),
  importFromExcel: () => ipcRenderer.invoke('import-from-excel'),
  openCalculator: () => ipcRenderer.invoke('open-calculator'),
  fetchAppData,
  saveAppData
});