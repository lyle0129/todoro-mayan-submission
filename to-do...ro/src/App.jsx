import { useState, useEffect } from 'react';
import Pomodoro from './components/pomodoro/Pomodoro.jsx'
import Todo from './components/todo/Todo.jsx'
import Settings, { THEMES } from './components/pomodoro/Settings.jsx'
import InstructionalModal from './InstructionalModal.jsx'
import { Settings as SettingsIcon } from 'lucide-react'
import './App.css'

function App() {
  // Theme state
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPomodoroVisible, setIsPomodoroVisible] = useState(true);
  const [heatmapShowNumbers, setHeatmapShowNumbers] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [instructionsFromSettings, setInstructionsFromSettings] = useState(false);

  // Timer settings state
  const [timerSettings, setTimerSettings] = useState({
    workDuration: 25 * 60,
    shortBreakDuration: 5 * 60,
    longBreakDuration: 15 * 60,
    longBreakInterval: 3
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('todoro-theme');
    const savedSettings = localStorage.getItem('todoro-settings');
    const savedPomodoroVisibility = localStorage.getItem('todoro-pomodoro-visible');
    const savedHeatmapShowNumbers = localStorage.getItem('todoro-heatmap-show-numbers');
    const instructionsSeen = localStorage.getItem('todoro-instructions-seen');

    if (savedTheme && THEMES[savedTheme]) {
      setCurrentTheme(savedTheme);
    }

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setTimerSettings(parsed);
      } catch (e) {
        console.error('Failed to parse saved settings');
      }
    }

    if (savedPomodoroVisibility !== null) {
      setIsPomodoroVisible(JSON.parse(savedPomodoroVisibility));
    }

    if (savedHeatmapShowNumbers !== null) {
      setHeatmapShowNumbers(JSON.parse(savedHeatmapShowNumbers));
    }

    // Show instructions on first visit
    if (!instructionsSeen) {
      setIsInstructionsOpen(true);
    }
  }, []);

  // Apply theme to document root
  useEffect(() => {
    const theme = THEMES[currentTheme];
    if (theme) {
      document.documentElement.style.setProperty('--theme-gradient', theme.gradient);
      document.documentElement.style.setProperty('--theme-primary', theme.primary);
      document.documentElement.style.setProperty('--theme-secondary', theme.secondary);
      document.documentElement.style.setProperty('--theme-accent', theme.accent);
    }
  }, [currentTheme]);

  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme);
    localStorage.setItem('todoro-theme', newTheme);
  };

  const handleDurationChange = (newSettings) => {
    setTimerSettings(newSettings);
    localStorage.setItem('todoro-settings', JSON.stringify(newSettings));
  };

  const togglePomodoroVisibility = () => {
    const newVisibility = !isPomodoroVisible;
    setIsPomodoroVisible(newVisibility);
    localStorage.setItem('todoro-pomodoro-visible', JSON.stringify(newVisibility));
  };

  const handleHeatmapShowNumbersChange = (showNumbers) => {
    setHeatmapShowNumbers(showNumbers);
    localStorage.setItem('todoro-heatmap-show-numbers', JSON.stringify(showNumbers));
  };

  const handleShowInstructions = () => {
    setInstructionsFromSettings(true);
    setIsInstructionsOpen(true);
  };

  const handleCloseInstructions = () => {
    setIsInstructionsOpen(false);
    setInstructionsFromSettings(false);
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <div className={`header-content ${!isPomodoroVisible ? 'centered-header' : ''}`}>
          <div className="title-section">
            <h1 className="app-title">To-doRo</h1>
            <p className="app-subtitle">Productivity meets simplicity</p>
          </div>
          <button
            className="settings-trigger"
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
          >
            <SettingsIcon size={24} />
          </button>
        </div>
      </div>
      <div className={`app-content ${!isPomodoroVisible ? 'centered' : ''}`}>
        <Todo
          isPomodoroVisible={isPomodoroVisible}
          onTogglePomodoro={togglePomodoroVisibility}
        />
        {isPomodoroVisible && (
          <Pomodoro
            workDuration={timerSettings.workDuration}
            shortBreakDuration={timerSettings.shortBreakDuration}
            longBreakDuration={timerSettings.longBreakDuration}
            longBreakInterval={timerSettings.longBreakInterval}
            currentTheme={currentTheme}
            heatmapShowNumbers={heatmapShowNumbers}
          />
        )}
      </div>

      <Settings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={currentTheme}
        onThemeChange={handleThemeChange}
        workDuration={timerSettings.workDuration}
        shortBreakDuration={timerSettings.shortBreakDuration}
        longBreakDuration={timerSettings.longBreakDuration}
        longBreakInterval={timerSettings.longBreakInterval}
        onDurationChange={handleDurationChange}
        heatmapShowNumbers={heatmapShowNumbers}
        onHeatmapShowNumbersChange={handleHeatmapShowNumbersChange}
        onShowInstructions={handleShowInstructions}
      />

      <InstructionalModal
        isOpen={isInstructionsOpen}
        onClose={handleCloseInstructions}
        isFromSettings={instructionsFromSettings}
      />
    </div>
  )
}

export default App
