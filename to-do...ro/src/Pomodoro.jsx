import { useState, useEffect, useRef, useMemo } from "react";
import { useSound } from 'use-sound';
import { Play, Pause, RotateCcw, Coffee, Clock, Zap, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, SkipForward, BarChart3 } from 'lucide-react';
import PomodoroHeatmap from './PomodoroHeatmap.jsx';
import './Pomodoro.css';

import doneTimer from './music/pomodone.mp3'
import yaLikeJazz from './music/jazz.mp3'

function Pomodoro({
    workDuration = 25 * 60,
    shortBreakDuration = 5 * 60,
    longBreakDuration = 15 * 60,
    longBreakInterval = 3,
    isTodoVisible = true,
    onToggleTodo,
    currentTheme = 'dark',
    heatmapShowNumbers = true
}) {
    const [timeLeft, setTimeLeft] = useState(workDuration);
    const [isRunning, setIsRunning] = useState(false);
    const [isWorkSession, setIsWorkSession] = useState(true);
    const [hasStarted, setHasStarted] = useState(false);
    const [isHeatmapVisible, setIsHeatmapVisible] = useState(true);

    const [pomodoroCount, setPomodoroCount] = useState(0); // completed work sessions
    const [displayCount, setDisplayCount] = useState(1);

    const jazzAudioRef = useRef(null);
    const [playDonePomo] = useSound(doneTimer, { volume: 0.5 });

    /* ---------- FIXED HELPERS ---------- */

    const isLongBreak = (completed) =>
        completed !== 0 && completed % longBreakInterval === 0;

    const getBreakDuration = (completed) =>
        isLongBreak(completed) ? longBreakDuration : shortBreakDuration;

    /* ---------- AUDIO INIT ---------- */

    useEffect(() => {
        jazzAudioRef.current = new Audio(yaLikeJazz);
        jazzAudioRef.current.loop = true;
        jazzAudioRef.current.volume = 0.05;

        return () => {
            jazzAudioRef.current?.pause();
            jazzAudioRef.current = null;
        };
    }, []);

    /* ---------- HEATMAP VISIBILITY ---------- */

    // Load heatmap visibility from localStorage
    useEffect(() => {
        const savedHeatmapVisibility = localStorage.getItem('todoro-heatmap-visible');
        if (savedHeatmapVisibility !== null) {
            setIsHeatmapVisible(JSON.parse(savedHeatmapVisibility));
        }
    }, []);

    const toggleHeatmapVisibility = () => {
        const newVisibility = !isHeatmapVisible;
        setIsHeatmapVisible(newVisibility);
        localStorage.setItem('todoro-heatmap-visible', JSON.stringify(newVisibility));
    };

    /* ---------- DURATION SYNC ---------- */

    useEffect(() => {
        if (!hasStarted) {
            setTimeLeft(
                isWorkSession
                    ? workDuration
                    : getBreakDuration(pomodoroCount)
            );
        }
    }, [
        hasStarted,
        isWorkSession,
        pomodoroCount,
        workDuration,
        shortBreakDuration,
        longBreakDuration
    ]);

    /* ---------- PROGRESS ---------- */

    const getCurrentDuration = useMemo(() => {
        return isWorkSession
            ? workDuration
            : getBreakDuration(pomodoroCount);
    }, [isWorkSession, workDuration, pomodoroCount]);

    const progress = isWorkSession
        ? (timeLeft / getCurrentDuration) * 100
        : ((getCurrentDuration - timeLeft) / getCurrentDuration) * 100;

    /* ---------- SKIP SESSION ---------- */

    function skipSession() {
        jazzAudioRef.current?.pause();

        if (isWorkSession) {
            const completed = pomodoroCount + 1;
            setPomodoroCount(completed);
            setIsWorkSession(false);
            setTimeLeft(getBreakDuration(completed));
            
            // Add completed pomodoro to heatmap
            if (window.addPomodoroToHeatmap) {
                window.addPomodoroToHeatmap();
            }
        } else {
            setIsWorkSession(true);
            setTimeLeft(workDuration);
            setDisplayCount(pomodoroCount + 1);
        }

        setIsRunning(false);
        setHasStarted(false);
        playDonePomo();
    }

    /* ---------- MANUAL MODES ---------- */

    function setWorkSession() {
        setIsWorkSession(true);
        setTimeLeft(workDuration);
        setIsRunning(false);
        setHasStarted(false);
        jazzAudioRef.current?.pause();
        jazzAudioRef.current.currentTime = 0;
    }

    function setShortBreakSession() {
        setIsWorkSession(false);
        setTimeLeft(shortBreakDuration);
        setIsRunning(false);
        setHasStarted(false);
        jazzAudioRef.current?.pause();
    }

    function setLongBreakSession() {
        setIsWorkSession(false);
        setTimeLeft(longBreakDuration);
        setIsRunning(false);
        setHasStarted(false);
        jazzAudioRef.current?.pause();
    }

    /* ---------- FORMAT ---------- */

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    /* ---------- TIMER ---------- */

    useEffect(() => {
        let timer = null;

        if (isRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(t => t - 1);
            }, 1000);
        }

        if (timeLeft === 0) {
            jazzAudioRef.current?.pause();

            if (isWorkSession) {
                const completed = pomodoroCount + 1;
                setPomodoroCount(completed);
                setIsWorkSession(false);
                setTimeLeft(getBreakDuration(completed));
                
                // Add completed pomodoro to heatmap
                if (window.addPomodoroToHeatmap) {
                    window.addPomodoroToHeatmap();
                }
            } else {
                setIsWorkSession(true);
                setTimeLeft(workDuration);
                setDisplayCount(pomodoroCount + 1);
            }

            setIsRunning(false);
            setHasStarted(false);
            playDonePomo();
        }

        return () => clearInterval(timer);
    }, [isRunning, timeLeft, isWorkSession, pomodoroCount]);

    /* ---------- MUSIC ---------- */

    useEffect(() => {
        if (!jazzAudioRef.current) return;

        if (isRunning && isWorkSession) {
            jazzAudioRef.current.play().catch(() => {});
        } else {
            jazzAudioRef.current.pause();
        }
    }, [isRunning, isWorkSession]);

    /* ---------- JSX ---------- */

    return (
        <div className="pomodoro-container">
            <div className="pomodoro-header">
                <div className="session-info">
                    <div className="session-type">
                        {isWorkSession ? (
                            <><Clock className="session-icon" /> Work Session</>
                        ) : (
                            <><Coffee className="session-icon" /> Break Time</>
                        )}
                    </div>
                    <div className="session-count">#{displayCount}</div>
                </div>
            </div>

            <div className="timer-display">
                <div className="timer-circle">
                    <svg className="progress-ring" width="280" height="280">
                        <circle
                            className="progress-ring-background"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="8"
                            fill="transparent"
                            r="130"
                            cx="140"
                            cy="140"
                        />
                        <circle
                            className="progress-ring-progress"
                            stroke={isWorkSession ? "var(--theme-accent, #f59e0b)" : "var(--theme-secondary, #10b981)"}
                            strokeWidth="8"
                            fill="transparent"
                            r="130"
                            cx="140"
                            cy="140"
                            strokeDasharray={`${2 * Math.PI * 130}`}
                            strokeDashoffset={`${2 * Math.PI * 130 * (1 - progress / 100)}`}
                            transform="rotate(-90 140 140)"
                        />
                    </svg>
                    <div className="timer-text">{formatTime(timeLeft)}</div>
                </div>
            </div>

            <div className="pomodoro-controls">
                <button
                    className={`control-btn primary ${isRunning ? 'running' : ''}`}
                    onClick={() => {
                        setIsRunning(!isRunning);
                        if (!isRunning) setHasStarted(true);
                    }}
                >
                    {isRunning ? <Pause size={20} /> : <Play size={20} />}
                    {isRunning ? 'Pause' : 'Start'}
                </button>

                <button
                    className="control-btn secondary"
                    onClick={() => {
                        setIsRunning(false);
                        setHasStarted(false);
                        jazzAudioRef.current?.pause();
                        jazzAudioRef.current.currentTime = 0;
                        setTimeLeft(
                            isWorkSession
                                ? workDuration
                                : getBreakDuration(pomodoroCount)
                        );
                    }}
                >
                    <RotateCcw size={20} />
                    Reset
                </button>

                {isRunning && (
                    <button
                        className="control-btn skip"
                        onClick={skipSession}
                    >
                        <SkipForward size={20} />
                    </button>
                )}
            </div>

            <div className="session-modes">
                <button
                    className={`mode-btn ${isWorkSession ? 'active' : ''}`}
                    onClick={setWorkSession}
                >
                    <Zap size={16} />
                    Work
                </button>
                <button
                    className={`mode-btn ${!isWorkSession && timeLeft === shortBreakDuration ? 'active' : ''}`}
                    onClick={setShortBreakSession}
                >
                    <Coffee size={16} />
                    Short Break
                </button>
                <button
                    className={`mode-btn ${!isWorkSession && timeLeft === longBreakDuration ? 'active' : ''}`}
                    onClick={setLongBreakSession}
                >
                    <Coffee size={16} />
                    Long Break
                </button>
            </div>

            <div className="todo-toggle-section">
                <button
                    className="heatmap-toggle-btn"
                    onClick={toggleHeatmapVisibility}
                >
                    <BarChart3 size={16} />
                    <span className="toggle-text">Heatmap</span>
                    {isHeatmapVisible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                <button
                    className="todo-toggle-pomodoro"
                    onClick={onToggleTodo}
                >
                    <span className="toggle-text">Tasks</span>
                    <span className="toggle-icon-desktop">
                        {isTodoVisible ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </span>
                    <span className="toggle-icon-mobile">
                        {isTodoVisible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                </button>
            </div>

            {isHeatmapVisible && (
                <PomodoroHeatmap 
                    isVisible={isHeatmapVisible}
                    onToggleVisibility={toggleHeatmapVisibility}
                    currentTheme={currentTheme}
                    showNumbers={heatmapShowNumbers}
                />
            )}
        </div>
    );
}

export default Pomodoro;
