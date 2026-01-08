import React, { useState } from 'react';
import { Settings as SettingsIcon, X, Palette, Clock, RotateCcw } from 'lucide-react';

const THEMES = {
  dark: {
    name: 'Dark Mode',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    primary: '#6366f1',
    secondary: '#10b981',
    accent: '#f59e0b'
  },
  default: {
    name: 'Ocean Breeze',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    primary: '#6366f1',
    secondary: '#10b981',
    accent: '#f59e0b'
  },
  sunset: {
    name: 'Sunset Glow',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
    primary: '#ec4899',
    secondary: '#f97316',
    accent: '#eab308'
  },
  forest: {
    name: 'Forest Green',
    gradient: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    primary: '#059669',
    secondary: '#0d9488',
    accent: '#84cc16'
  },
  midnight: {
    name: 'Midnight Blue',
    gradient: 'linear-gradient(135deg, #2c3e50 0%, #4a6741 100%)',
    primary: '#3b82f6',
    secondary: '#06b6d4',
    accent: '#8b5cf6'
  },
  cherry: {
    name: 'Cherry Blossom',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    primary: '#dc2626',
    secondary: '#ea580c',
    accent: '#ca8a04'
  }
};

function Settings({ 
  isOpen, 
  onClose, 
  theme, 
  onThemeChange,
  workDuration,
  shortBreakDuration,
  longBreakDuration,
  longBreakInterval,
  onDurationChange
}) {
  const [tempSettings, setTempSettings] = useState({
    workDuration: Math.floor(workDuration / 60),
    shortBreakDuration: Math.floor(shortBreakDuration / 60),
    longBreakDuration: Math.floor(longBreakDuration / 60),
    longBreakInterval
  });

  const handleSave = () => {
    onDurationChange({
      workDuration: tempSettings.workDuration * 60,
      shortBreakDuration: tempSettings.shortBreakDuration * 60,
      longBreakDuration: tempSettings.longBreakDuration * 60,
      longBreakInterval: tempSettings.longBreakInterval
    });
    onClose();
  };

  const handleReset = () => {
    const defaultSettings = {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 3
    };
    setTempSettings(defaultSettings);
    onDurationChange({
      workDuration: defaultSettings.workDuration * 60,
      shortBreakDuration: defaultSettings.shortBreakDuration * 60,
      longBreakDuration: defaultSettings.longBreakDuration * 60,
      longBreakInterval: defaultSettings.longBreakInterval
    });
    onThemeChange('dark');
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <div className="settings-title">
            <SettingsIcon size={24} />
            <h2>Settings</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="settings-content">
          {/* Theme Selection */}
          <div className="settings-section">
            <div className="section-header">
              <Palette size={20} />
              <h3>Color Theme</h3>
            </div>
            <div className="theme-grid">
              {Object.entries(THEMES).map(([key, themeData]) => (
                <button
                  key={key}
                  className={`theme-option ${theme === key ? 'active' : ''}`}
                  onClick={() => onThemeChange(key)}
                  style={{ background: themeData.gradient }}
                >
                  <div className="theme-preview">
                    <div 
                      className="theme-dot" 
                      style={{ backgroundColor: themeData.primary }}
                    ></div>
                    <div 
                      className="theme-dot" 
                      style={{ backgroundColor: themeData.secondary }}
                    ></div>
                    <div 
                      className="theme-dot" 
                      style={{ backgroundColor: themeData.accent }}
                    ></div>
                  </div>
                  <span className="theme-name">{themeData.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Timer Durations */}
          <div className="settings-section">
            <div className="section-header">
              <Clock size={20} />
              <h3>Timer Durations</h3>
            </div>
            <div className="duration-controls">
              <div className="duration-item">
                <label>Work Session (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={tempSettings.workDuration}
                  onChange={(e) => setTempSettings(prev => ({
                    ...prev,
                    workDuration: parseInt(e.target.value) || 25
                  }))}
                />
              </div>
              <div className="duration-item">
                <label>Short Break (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={tempSettings.shortBreakDuration}
                  onChange={(e) => setTempSettings(prev => ({
                    ...prev,
                    shortBreakDuration: parseInt(e.target.value) || 5
                  }))}
                />
              </div>
              <div className="duration-item">
                <label>Long Break (minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={tempSettings.longBreakDuration}
                  onChange={(e) => setTempSettings(prev => ({
                    ...prev,
                    longBreakDuration: parseInt(e.target.value) || 15
                  }))}
                />
              </div>
              <div className="duration-item">
                <label>Long Break Every (sessions)</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={tempSettings.longBreakInterval}
                  onChange={(e) => setTempSettings(prev => ({
                    ...prev,
                    longBreakInterval: parseInt(e.target.value) || 3
                  }))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="reset-btn" onClick={handleReset}>
            <RotateCcw size={16} />
            Reset to Defaults
          </button>
          <div className="footer-actions">
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button className="save-btn" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { THEMES };
export default Settings;