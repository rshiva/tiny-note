const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

class DatabaseService {
  getDbPath() {
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, 'notes.db');
  }

  constructor() {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'notes.db');
    this.db = new Database(dbPath);
    this.initDatabase();
  }
  
  
  initDatabase() {
    const createNotesTable = `
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TEXT,
        updated_at TEXT
      )
    `;

    const createSettingsTable = `
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `;

    const createAppStateTable = `
      CREATE TABLE IF NOT EXISTS app_state (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `;

    this.db.exec(createNotesTable);
    this.db.exec(createSettingsTable);
    this.db.exec(createAppStateTable);
  }

  getAllNotes() {
    const query = 'SELECT * FROM notes ORDER BY updated_at DESC';
    return this.db.prepare(query).all();
  }

  getNoteById(id) {
    const query = 'SELECT * FROM notes WHERE id = ?';
    return this.db.prepare(query).get(id);
  }

  createNote(note) {
    const query = `
      INSERT INTO notes (id, content, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `;
    const stmt = this.db.prepare(query);
    stmt.run(note.id, note.content, note.createdAt, note.updatedAt);
    return this.getNoteById(note.id);
  }

  updateNote(id, content, updatedAt) {
    const query = `
      UPDATE notes 
      SET content = ?, updated_at = ?
      WHERE id = ?
    `;
    const stmt = this.db.prepare(query);
    stmt.run(content, updatedAt, id);
    return this.getNoteById(id);
  }

  deleteNote(id) {
    const query = 'DELETE FROM notes WHERE id = ?';
    const stmt = this.db.prepare(query);
    return stmt.run(id);
  }

  getSettingByKey(key) {
    const query = 'SELECT value FROM settings WHERE key = ?';
    const result = this.db.prepare(query).get(key);
    return result ? JSON.parse(result.value) : null;
  }

  saveSetting(key, value) {
    const query = `
      INSERT OR REPLACE INTO settings (key, value)
      VALUES (?, ?)
    `;
    const stmt = this.db.prepare(query);
    return stmt.run(key, JSON.stringify(value));
  }

  getBackupSettings() {
    return this.getSettingByKey('iCloudBackup') || {
      enabled: true,
      frequency: 'daily',
      lastBackup: null
    };
  }

  saveBackupSettings(backupSettings) {
    return this.saveSetting('iCloudBackup', backupSettings);
  }

  getLastActiveNote() {
    const query = 'SELECT value FROM app_state WHERE key = ?';
    const result = this.db.prepare(query).get('lastActiveNote');
    return result ? result.value : null;
  }

  setLastActiveNote(noteId) {
    const query = `
      INSERT OR REPLACE INTO app_state (key, value)
      VALUES (?, ?)
    `;
    const stmt = this.db.prepare(query);
    return stmt.run('lastActiveNote', noteId);
  }
}

module.exports = DatabaseService; 