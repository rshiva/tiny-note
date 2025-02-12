const { contextBridge, ipcRenderer, ipcMain } = require('electron');

contextBridge.exposeInMainWorld("electronAPI", {
  getAllNotes: () => ipcRenderer.invoke("get-all-notes"),
  createNote: (note) => ipcRenderer.invoke("create-note", note),
  updateNote: (note) => ipcRenderer.invoke("update-note", note),
  deleteNote: (id) => ipcRenderer.invoke("delete-note", id),
  getSettings: () => ipcRenderer.invoke("get-settings"),
  saveSettings: (settings) => ipcRenderer.invoke("save-settings", settings),
  onShowSettings: (callback) => ipcRenderer.on("show-settings", callback),
  offShowSettings: (callback) =>
    ipcRenderer.removeListener("show-settings", callback),
  getICloudStatus: () => ipcRenderer.invoke("get-icloud-status"),
  backupToICloud: () => ipcRenderer.invoke("backup-to-icloud"),
  getLastActiveNote: () => ipcRenderer.invoke("get-last-active-note"),
  setLastActiveNote: (noteId) =>
    ipcRenderer.invoke("set-last-active-note", noteId),

  showDeleteConfirmation: () => ipcRenderer.invoke("show-delete-confirmation"),
}); 