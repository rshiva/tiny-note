const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAllNotes: () => ipcRenderer.invoke('get-all-notes'),
  createNote: (note) => ipcRenderer.invoke('create-note', note),
  updateNote: (note) => ipcRenderer.invoke('update-note', note),
  deleteNote: (id) => ipcRenderer.invoke('delete-note', id),
}); 