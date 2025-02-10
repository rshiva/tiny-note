import React, { useState, useEffect } from 'react';
import './Settings.css';

function Settings({ onClose, currentSettings, onSave }) {
  // Initialize with default values and merge with currentSettings
  const [settings, setSettings] = useState(() => ({
    iCloudBackup: {
      enabled: false,
      frequency: 'daily',
      lastBackup: null,
      ...(currentSettings?.iCloudBackup || {})
    }
  }));
  const [iCloudStatus, setICloudStatus] = useState(null);

  // Update local state when currentSettings changes
  useEffect(() => {
    if (currentSettings?.iCloudBackup) {
      setSettings(prevSettings => ({
        ...prevSettings,
        iCloudBackup: {
          ...prevSettings.iCloudBackup,
          ...currentSettings.iCloudBackup
        }
      }));
    }
  }, [currentSettings]);

  useEffect(() => {
    const checkICloudStatus = async () => {
      const status = await window.electronAPI.getICloudStatus();
      setICloudStatus(status);
    };
    checkICloudStatus();
  }, []);

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleFrequencyChange = (e) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      iCloudBackup: {
        ...prevSettings.iCloudBackup,
        frequency: e.target.value
      }
    }));
  };

  const handleBackupToggle = (e) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      iCloudBackup: {
        ...prevSettings.iCloudBackup,
        enabled: e.target.checked
      }
    }));
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        {/* <h2>Settings</h2> */}
        
        <div className="settings-section">
          <h3>iCloud Backup</h3>
          
          {/* <div className="backup-status">
            {iCloudStatus?.available ? (
              <p className="backup-location">
                Your notes are being backed up to:
                <br />
                <code>{iCloudStatus.path}/notes.db</code>
              </p>
            ) : (
              <p className="backup-warning">
                iCloud Drive is not available. Please enable iCloud Drive to use automatic backups.
              </p>
            )}
          </div> */}

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.iCloudBackup.enabled}
                onChange={handleBackupToggle}
              />
              <span>Enable Automatic Backup</span>
            </label>
          </div>

          <div className="setting-item">
            <label>Backup Frequency:</label>
            <select
              value={settings.iCloudBackup.frequency}
              onChange={handleFrequencyChange}
              disabled={!settings.iCloudBackup.enabled}
            >
              <option value="1min">Every Minute</option>
              <option value="5min">Every 5 Minutes</option>
              <option value="hourly">Every Hour</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>

        <div className="settings-actions">
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default Settings; 