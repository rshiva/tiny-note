const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, dialog } = require('electron');
const path = require('path');
// const isDev = process.env.NODE_ENV !== 'production';
const isDev = !app.isPackaged;
const DatabaseService = require('../src/services/database');
const SettingsService = require('../src/services/settings');
const os = require('os');
const fs = require('fs');

let db;
let settings;
let tray = null;
let mainWindow = null;

// Position window relative to tray
function positionWindow() {
  const { screen } = require('electron');
  const display = screen.getPrimaryDisplay();
  const windowBounds = mainWindow.getBounds();
  const trayBounds = tray.getBounds();
  
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));
  const y = Math.round(trayBounds.y + trayBounds.height);
  
  mainWindow.setPosition(x, y);
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    show: false,
    frame: false,
    transparent: true,
    vibrancy: "under-window",
    visualEffectState: "active",
    resizable: false,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Hide the window from Cmd+Tab and the Dock (macOS)
  mainWindow.setSkipTaskbar(true); // ✅ Correct usage

  // Hide window when it loses focus
  mainWindow.on('blur', () => {
    mainWindow.hide();
  });

  // Load the index.html from a url if in development
  // or the local file if in production.
  console.log("isDev--->", isDev, process.env.NODE_ENV);
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  } else {
    // Log the path to help debug
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log("isProduct--->", path.join(app.getAppPath(), 'dist', 'index.html'));
    console.log('Loading from:', indexPath);
    try {
      mainWindow.loadFile(indexPath);
    } catch (error) {
      console.error('Error loading file:', error);
    }
  }

  return mainWindow;
}

function createTray() {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, '../assets/tray-icon.png')
  ).resize({ width: 20, height: 20 });

  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Notes',
      click: () => {
        mainWindow.show();
        positionWindow();
      }
    },
    {
      label: 'Settings',
      click: () => {
        mainWindow.show();
        positionWindow();
        mainWindow.webContents.send('show-settings');
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Tiny Note');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      positionWindow();
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  db = new DatabaseService();
  settings = new SettingsService();
  settings.setDatabase(db);
  createWindow();
  createTray();


  // Hide the Dock icon on macOS so the app doesn't appear in Cmd+Tab
  if (process.platform === 'darwin') {
    app.dock.hide();
  }
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

// Settings IPC handlers
ipcMain.handle('get-settings', () => {
  return settings.getSettings();
});

ipcMain.handle('save-settings', (_, newSettings) => {
  settings.updateSettings(newSettings);
  return settings.getSettings();
});

function getICloudPath() {
  // Temporarily use Documents folder instead of iCloud
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Documents/');
  }
  if (process.platform === 'win32') {
    return path.join(os.homedir(), 'Documents/TinyNote');
  }
  return null;
}

ipcMain.handle('get-icloud-status', () => {
  const iCloudPath = getICloudPath();
  return {
    available: iCloudPath && fs.existsSync(iCloudPath),
    path: iCloudPath
  };
});

ipcMain.handle('backup-to-icloud', async () => {
  const backupPath = getICloudPath();
  if (!backupPath) {
    console.log('Backup path not available');
    return { success: false, error: 'Backup path not available' };
  }

  try {
    const dbPath = path.join(app.getPath('userData'), 'notes.db');
    await fs.promises.mkdir(backupPath, { recursive: true });
    const backupFilePath = path.join(backupPath, 'notes_backup.db');
    const tempPath = backupFilePath + '.tmp';

    console.log('Creating backup at:', backupFilePath);

    // Create atomic backup
    await fs.promises.copyFile(dbPath, tempPath);
    await fs.promises.rename(tempPath, backupFilePath);
    
    console.log('Backup completed successfully');
    return { success: true, path: backupFilePath };
  } catch (err) {
    console.error('Backup failed:', err);
    return { success: false, error: err.message };
  }
});

// Update these handlers to use the DatabaseService methods
ipcMain.handle('get-last-active-note', async () => {
  try {
    return db.getLastActiveNote();
  } catch (error) {
    console.error('Error getting last active note:', error);
    return null;
  }
});

ipcMain.handle('set-last-active-note', async (event, noteId) => {
  try {
    db.setLastActiveNote(noteId);
    return true;
  } catch (error) {
    console.error('Error setting last active note:', error);
    return false;
  }
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