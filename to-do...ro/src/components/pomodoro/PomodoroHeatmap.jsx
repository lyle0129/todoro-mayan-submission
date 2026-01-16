import { useState, useEffect, useRef } from 'react';
import { BarChart3, Download } from 'lucide-react';
import './PomodoroHeatmap.css';

function PomodoroHeatmap({ isVisible, onToggleVisibility, currentTheme, showNumbers = false }) {
    const [heatmapData, setHeatmapData] = useState({});
    const canvasRef = useRef(null);

    // Get current week's Monday as the key (using local time)
    const getCurrentWeekKey = () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const monday = new Date(now);
        monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        monday.setHours(0, 0, 0, 0);
        // Use local date instead of UTC to avoid timezone issues
        const year = monday.getFullYear();
        const month = String(monday.getMonth() + 1).padStart(2, '0');
        const day = String(monday.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Get current date key (using local time)
    const getCurrentDateKey = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Load heatmap data from localStorage
    useEffect(() => {
        const currentWeek = getCurrentWeekKey();
        const savedData = localStorage.getItem('todoro-heatmap');

        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                // Check if we need to reset for a new week
                if (parsed.weekKey !== currentWeek) {
                    // New week, reset data
                    const newData = { weekKey: currentWeek, sessions: {} };
                    setHeatmapData(newData);
                    localStorage.setItem('todoro-heatmap', JSON.stringify(newData));
                } else {
                    setHeatmapData(parsed);
                }
            } catch (e) {
                console.error('Failed to parse heatmap data');
                const newData = { weekKey: currentWeek, sessions: {} };
                setHeatmapData(newData);
                localStorage.setItem('todoro-heatmap', JSON.stringify(newData));
            }
        } else {
            const newData = { weekKey: currentWeek, sessions: {} };
            setHeatmapData(newData);
            localStorage.setItem('todoro-heatmap', JSON.stringify(newData));
        }
    }, []);

    // Function to add a completed pomodoro session
    const addPomodoroSession = () => {
        const today = getCurrentDateKey();
        const currentWeek = getCurrentWeekKey();

        setHeatmapData(prevData => {
            const newData = {
                weekKey: currentWeek,
                sessions: {
                    ...prevData.sessions,
                    [today]: (prevData.sessions[today] || 0) + 1
                }
            };
            localStorage.setItem('todoro-heatmap', JSON.stringify(newData));
            return newData;
        });
    };

    // Expose the function to parent component
    useEffect(() => {
        window.addPomodoroToHeatmap = addPomodoroSession;
        return () => {
            delete window.addPomodoroToHeatmap;
        };
    }, []);

    // Generate week days for current week
    const getWeekDays = () => {
        const currentWeek = getCurrentWeekKey();
        const monday = new Date(currentWeek + 'T00:00:00'); // Add time to avoid timezone issues
        const days = [];
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        for (let i = 0; i < 7; i++) {
            const day = new Date(monday);
            day.setDate(monday.getDate() + i);
            // Use local date formatting to avoid timezone conversion
            const year = day.getFullYear();
            const month = String(day.getMonth() + 1).padStart(2, '0');
            const dayNum = String(day.getDate()).padStart(2, '0');
            const dateKey = `${year}-${month}-${dayNum}`;

            days.push({
                date: dateKey,
                dayName: dayNames[i],
                dayNumber: day.getDate(),
                sessions: heatmapData.sessions?.[dateKey] || 0
            });
        }

        return days;
    };

    // Get intensity class based on session count
    const getIntensityClass = (sessions) => {
        if (sessions === 0) return 'intensity-0';
        if (sessions <= 2) return 'intensity-1';
        if (sessions <= 4) return 'intensity-2';
        if (sessions <= 6) return 'intensity-3';
        return 'intensity-4';
    };

    // Export heatmap as PNG
    const exportAsPNG = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Set canvas size
        canvas.width = 400;
        canvas.height = 200;

        // Get theme colors
        const themeColors = getThemeColors();

        // Clear canvas with background
        ctx.fillStyle = themeColors.background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw title
        ctx.fillStyle = themeColors.text;
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Weekly ToDoRo Heatmap', canvas.width / 2, 30);

        // Draw week info
        ctx.font = '12px Inter, sans-serif';
        const weekStart = new Date(heatmapData.weekKey);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const weekText = `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
        ctx.fillText(weekText, canvas.width / 2, 50);

        // Draw heatmap
        const days = getWeekDays();
        const cellSize = 40;
        const startX = (canvas.width - (days.length * cellSize + (days.length - 1) * 5)) / 2;
        const startY = 80;

        days.forEach((day, index) => {
            const x = startX + index * (cellSize + 5);
            const y = startY;

            // Draw cell background
            ctx.fillStyle = getHeatmapColor(day.sessions, themeColors);
            ctx.fillRect(x, y, cellSize, cellSize);

            // Draw day name
            ctx.fillStyle = themeColors.text;
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(day.dayName, x + cellSize / 2, y - 5);

            // Draw day number
            ctx.fillText(day.dayNumber.toString(), x + cellSize / 2, y + cellSize + 15);

            // Draw session count
            if (showNumbers) {
                ctx.fillStyle = day.sessions > 2 ? '#ffffff' : themeColors.text;
                ctx.font = 'bold 12px Inter, sans-serif';
                ctx.fillText(day.sessions.toString(), x + cellSize / 2, y + cellSize / 2 + 4);
            }
        });

        // Draw legend
        ctx.fillStyle = themeColors.text;
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Less', 20, canvas.height - 20);

        // Draw legend squares
        for (let i = 0; i <= 4; i++) {
            const x = 50 + i * 15;
            const y = canvas.height - 30;
            ctx.fillStyle = getHeatmapColor(i * 2, themeColors);
            ctx.fillRect(x, y, 10, 10);
        }

        ctx.fillStyle = themeColors.text;
        ctx.textAlign = 'left';
        ctx.fillText('More', 50 + 5 * 15, canvas.height - 20);

        // Download the image
        const link = document.createElement('a');
        link.download = `todoro-heatmap-${heatmapData.weekKey}.png`;
        link.href = canvas.toDataURL();
        link.click();
    };

    // Get theme-appropriate colors
    const getThemeColors = () => {
        const root = getComputedStyle(document.documentElement);
        return {
            background: '#ffffff',
            text: '#374151',
            primary: root.getPropertyValue('--theme-primary').trim() || '#6366f1',
            secondary: root.getPropertyValue('--theme-secondary').trim() || '#10b981',
            accent: root.getPropertyValue('--theme-accent').trim() || '#f59e0b'
        };
    };

    // Get heatmap color based on session count
    const getHeatmapColor = (sessions, themeColors) => {
        if (sessions === 0) return '#f3f4f6';
        if (sessions <= 2) return themeColors.primary + '40';
        if (sessions <= 4) return themeColors.primary + '70';
        if (sessions <= 6) return themeColors.primary + 'a0';
        return themeColors.primary;
    };

    const weekDays = getWeekDays();
    const totalSessions = Object.values(heatmapData.sessions || {}).reduce((sum, count) => sum + count, 0);

    if (!isVisible) return null;

    return (
        <div className="heatmap-container">
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div className="heatmap-header">
                <div className="heatmap-title">
                    <BarChart3 className="heatmap-icon" />
                    <span>Weekly ToDoRo Heatmap</span>
                </div>
                <div className="heatmap-stats">
                    <span className="total-sessions">{totalSessions} sessions this week</span>
                </div>
            </div>

            <div className="heatmap-grid">
                {weekDays.map((day, index) => (
                    <div key={day.date} className="heatmap-day">
                        <div className="day-label">{day.dayName}</div>
                        <div
                            className={`heatmap-cell ${getIntensityClass(day.sessions)}`}
                            title={`${day.sessions} sessions on ${day.dayName}, ${day.dayNumber}`}
                        >
                            {showNumbers && <span className="session-count">{day.sessions}</span>}
                        </div>
                        <div className="day-number">{day.dayNumber}</div>
                    </div>
                ))}
            </div>

            <div className="heatmap-legend">
                <span className="legend-label">Less</span>
                <div className="legend-squares">
                    {[0, 1, 2, 3, 4].map(level => (
                        <div
                            key={level}
                            className={`legend-square intensity-${level}`}
                        />
                    ))}
                </div>
                <span className="legend-label">More</span>
            </div>

            <div className="heatmap-actions">
                <button
                    className="export-btn"
                    onClick={exportAsPNG}
                    title="Export as PNG"
                >
                    <Download size={16} />
                    Export PNG
                </button>
            </div>
        </div>
    );
}

export default PomodoroHeatmap;