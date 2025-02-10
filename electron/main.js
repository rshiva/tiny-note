const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV !== 'production';
const DatabaseService = require('../src/services/database');

let db;

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  // Load the index.html from a url if in development
  // or the local file if in production.
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  db = new DatabaseService();
  console.log('Database location:', db.getDbPath());
  createWindow();
});

// Handle IPC events
ipcMain.handle('get-all-notes', async () => {
  return db.getAllNotes();
});

ipcMain.handle('create-note', async (_, note) => {
  return db.createNote(note);
});

ipcMain.handle('update-note', async (_, { id, content, updatedAt }) => {
  return db.updateNote(id, content, updatedAt);
});

ipcMain.handle('delete-note', async (_, id) => {
  return db.deleteNote(id);
});

// Quit when all windows are closed.
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