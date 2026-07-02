const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'assets', 'icon.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false
    }
  });

  mainWindow.maximize();
  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for Excel operations
ipcMain.handle('export-to-excel', async (event, data, filename) => {
  const result = await dialog.showSaveDialog({
    title: 'حفظ ملف Excel',
    defaultPath: filename,
    filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
  });

  if (!result.canceled) {
    return result.filePath;
  }
  return null;
});

ipcMain.handle('import-from-excel', async () => {
  const result = await dialog.showOpenDialog({
    title: 'اختر ملف Excel',
    filters: [{ name: 'Excel Files', extensions: ['xlsx'] }],
    properties: ['openFile']
  });

  if (!result.canceled) {
    const workbook = XLSX.readFile(result.filePaths[0]);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    return data;
  }
  return [];
});

ipcMain.handle('open-calculator', async () => {
  const platform = process.platform;
  return new Promise((resolve, reject) => {
    let command;
    if (platform === 'win32') {
      command = 'calc.exe';
    } else if (platform === 'darwin') {
      command = 'open -a Calculator';
    } else {
      command = 'gnome-calculator || kcalc || galculator || xcalc';
    }

    exec(command, (error) => {
      if (error) {
        reject(new Error('تعذر فتح الآلة الحاسبة. تأكد من توفر تطبيق الآلة الحاسبة على النظام.'));
      } else {
        resolve(true);
      }
    });
  });
});