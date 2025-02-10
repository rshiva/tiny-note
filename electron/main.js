const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV !== 'production';
const DatabaseService = require('../src/services/database');

let db;
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
    vibrancy: 'under-window',
    visualEffectState: 'active',
    resizable: false,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  // Hide window when it loses focus
  mainWindow.on('blur', () => {
    mainWindow.hide();
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

  return mainWindow;
}

function createTray() {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, '../assets/tray-icon.png')
  ).resize({ width: 16, height: 16 });

  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Notes',
      click: () => {
        mainWindow.show();
        positionWindow();
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
  createWindow();
  createTray();
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