const { app } = require('electron');
const path = require('path');
const fs = require('fs');

class SettingsService {
  constructor() {
    this.settingsPath = path.join(app.getPath('userData'), 'settings.json');
    this.db = null;
    this.loadSettings();
  }

  setDatabase(db) {
    this.db = db;
  }

  async loadSettings() {
    try {
      if (this.db) {
        // Load from database
        this.settings = {
          iCloudBackup: this.db.getBackupSettings()
        };
      } else if (fs.existsSync(this.settingsPath)) {
        // Fallback to file if database not ready
        const data = fs.readFileSync(this.settingsPath, 'utf8');
        this.settings = JSON.parse(data);
      } else {
        this.settings = {
          iCloudBackup: {
            enabled: true,
            frequency: 'daily',
            lastBackup: null
          }
        };
      }
      this.saveSettings();
    } catch (error) {
      console.error('Error loading settings:', error);
      this.settings = {
        iCloudBackup: {
          enabled: true,
          frequency: 'daily',
          lastBackup: null
        }
      };
    }
  }

  saveSettings() {
    try {
      // Save to database if available
      if (this.db) {
        this.db.saveBackupSettings(this.settings.iCloudBackup);
      }
      // Also save to file as backup
      fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  getSettings() {
    return this.settings;
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  async checkAndPerformICloudBackup() {
    if (!this.settings.iCloudBackup?.enabled) {
      console.log('Backup is disabled');
      return;
    }

    try {
      const iCloudStatus = await window.electronAPI.getICloudStatus();
      console.log('Backup location:', iCloudStatus.path);
      
      if (!iCloudStatus.available) {
        console.log('Backup location is not available');
        return;
      }

      const lastBackup = new Date(this.settings.iCloudBackup.lastBackup || 0);
      const now = new Date();
      
      const hoursSinceBackup = (now - lastBackup) / (1000 * 60 * 60);
      console.log('Hours since last backup:', hoursSinceBackup);

      let shouldBackup = false;
      switch (this.settings.iCloudBackup.frequency) {
        case '1min':
          shouldBackup = hoursSinceBackup >= (1 / 60);
          break;
        case '5min':
          shouldBackup = hoursSinceBackup >= (5 / 60);
          break;
        case 'hourly':
          shouldBackup = hoursSinceBackup >= 1;
          break;
        case 'daily':
          shouldBackup = hoursSinceBackup >= 24;
          break;
        case 'weekly':
          shouldBackup = hoursSinceBackup >= 168;
          break;
      }

      console.log('Should backup?', shouldBackup);

      if (shouldBackup) {
        console.log('Initiating backup...');
        const result = await window.electronAPI.backupToICloud();
        if (result.success) {
          console.log('Backup successful at:', result.path);
          this.settings.iCloudBackup.lastBackup = now.toISOString();
          this.saveSettings();
        } else {
          console.error('Backup failed:', result.error);
        }
      }
    } catch (err) {
      console.error('Backup process error:', err);
    }
  }
}

module.exports = SettingsService; 