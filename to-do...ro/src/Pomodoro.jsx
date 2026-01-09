import { useState, useEffect, useRef } from "react";
import { useSound } from 'use-sound';
import { Play, Pause, RotateCcw, Coffee, Clock, Zap, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, SkipForward } from 'lucide-react';

import doneTimer from './music/pomodone.mp3'
import yaLikeJazz from './music/jazz.mp3'

function Pomodoro({
    workDuration = 25 * 60,
    shortBreakDuration = 5 * 60,
    longBreakDuration = 15 * 60,
    longBreakInterval = 3,
    isTodoVisible = true,
    onToggleTodo
}) {
    const [timeLeft, setTimeLeft] = useState(workDuration);
    const [isRunning, setIsRunning] = useState(false);
    const [isWorkSession, setIsWorkSession] = useState(true);
    const [hasStarted, setHasStarted] = useState(false);

    const [pomodoroCount, setPomodoroCount] = useState(0);
    const [displayCount, setDisplayCount] = useState(1);

    // Audio refs for better control
    const jazzAudioRef = useRef(null);

    // Initialize audio
    useEffect(() => {
        jazzAudioRef.current = new Audio(yaLikeJazz);
        jazzAudioRef.current.loop = true;
        jazzAudioRef.current.volume = 0.05;

        return () => {
            if (jazzAudioRef.current) {
                jazzAudioRef.current.pause();
                jazzAudioRef.current = null;
            }
        };
    }, []);

    // Update timeLeft when durations change, but only if timer hasn't been started yet
    useEffect(() => {
        if (!hasStarted) {
            if (isWorkSession) {
                setTimeLeft(workDuration);
            } else {
                const shouldBeLongBreak = ((pomodoroCount + 1) % longBreakInterval === 0);
                setTimeLeft(shouldBeLongBreak ? longBreakDuration : shortBreakDuration);
            }
        }
    }, [workDuration, shortBreakDuration, longBreakDuration, longBreakInterval, isWorkSession, pomodoroCount, hasStarted]);

    // Calculate progress for visual timer
    const getCurrentDuration = () => {
        if (isWorkSession) return workDuration;
        // For breaks, check if the next completed session would trigger a long break
        return ((pomodoroCount + 1) % longBreakInterval === 0) ? longBreakDuration : shortBreakDuration;
    };

    // For work sessions: show depleting (remaining time)
    // For breaks: show filling (elapsed time)
    const progress = isWorkSession
        ? (timeLeft / getCurrentDuration()) * 100  // Depleting - shows remaining time
        : ((getCurrentDuration() - timeLeft) / getCurrentDuration()) * 100; // Filling - shows elapsed time

    // Skip session function
    function skipSession() {
        // Stop music when session is skipped
        if (jazzAudioRef.current) {
            jazzAudioRef.current.pause();
        }

        if (isWorkSession) {
            // Increment count to represent completed sessions
            const newCount = pomodoroCount + 1;
            setPomodoroCount(newCount);

            // Check if this completed work session should trigger a long break
            // Long break after sessions 3, 6, 9, etc.
            if (newCount % longBreakInterval === 0) {
                setIsWorkSession(false);
                setTimeLeft(longBreakDuration);
            } else {
                setIsWorkSession(false);
                setTimeLeft(shortBreakDuration);
            }

            setIsRunning(false);
            setHasStarted(false);
        } else {
            setIsWorkSession(true);
            setTimeLeft(workDuration);
            setDisplayCount(pomodoroCount + 1);
            setIsRunning(false);
            setHasStarted(false);
        }
        playDonePomo();
    }

    // Manual mode buttons
    function setWorkSession() {
        setIsWorkSession(true);
        setTimeLeft(workDuration);
        setIsRunning(false);
        setHasStarted(false);
        if (jazzAudioRef.current) {
            jazzAudioRef.current.pause();
            jazzAudioRef.current.currentTime = 0;
        }
    }

    function setShortBreakSession() {
        setIsWorkSession(false);
        setTimeLeft(shortBreakDuration);
        setIsRunning(false);
        setHasStarted(false);
        if (jazzAudioRef.current) {
            jazzAudioRef.current.pause();
        }
    }

    function setLongBreakSession() {
        setIsWorkSession(false);
        setTimeLeft(longBreakDuration);
        setIsRunning(false);
        setHasStarted(false);
        if (jazzAudioRef.current) {
            jazzAudioRef.current.pause();
        }
    }

    const [playDonePomo] = useSound(doneTimer, { volume: 0.5 });

    // Format seconds -> MM:SS
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    // Timer logic
    useEffect(() => {
        let timer = null;

        if (isRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);

        } else if (timeLeft === 0) {
            // Stop music when session ends
            if (jazzAudioRef.current) {
                jazzAudioRef.current.pause();
            }

            if (isWorkSession) {
                // Increment count to represent completed sessions
                const newCount = pomodoroCount + 1;
                setPomodoroCount(newCount);

                // Check if this completed work session should trigger a long break
                // Long break after sessions 3, 6, 9, etc.
                if (newCount % longBreakInterval === 0) {
                    setIsWorkSession(false);
                    setTimeLeft(longBreakDuration);
                } else {
                    setIsWorkSession(false);
                    setTimeLeft(shortBreakDuration);
                }

                setIsRunning(false);
                setHasStarted(false);
            } else {
                setIsWorkSession(true);
                setTimeLeft(workDuration);
                setDisplayCount(pomodoroCount + 1);
                setIsRunning(false);
                setHasStarted(false);
            }
            playDonePomo();
        }

        return () => {
            clearInterval(timer);
        };
    }, [isRunning, timeLeft, isWorkSession, longBreakDuration, shortBreakDuration, workDuration, longBreakInterval, pomodoroCount, playDonePomo]);

    // Music playback control with pause/resume functionality
    useEffect(() => {
        if (isRunning && isWorkSession && jazzAudioRef.current) {
            // Start or resume music
            const playPromise = jazzAudioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Audio play failed:", error);
                });
            }
        } else if (jazzAudioRef.current && isWorkSession) {
            // Pause music (maintains current position)
            jazzAudioRef.current.pause();
        } else if (jazzAudioRef.current && !isWorkSession) {
            // Stop music completely for breaks
            jazzAudioRef.current.pause();
        }
    }, [isRunning, isWorkSession]);

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
                        if (!isRunning) {
                            setHasStarted(true); // Mark as started when play is pressed
                        }
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
                        if (jazzAudioRef.current) {
                            jazzAudioRef.current.pause();
                            jazzAudioRef.current.currentTime = 0; // Reset music to beginning
                        }
                        if (isWorkSession) {
                            setTimeLeft(workDuration);
                        } else {
                            if (((pomodoroCount + 1) % longBreakInterval === 0)) {
                                setTimeLeft(longBreakDuration);
                            } else {
                                setTimeLeft(shortBreakDuration);
                            }
                        }
                    }}
                >
                    <RotateCcw size={20} />
                    Reset
                </button>

                {isRunning && (
                    <button
                        className="control-btn skip"
                        onClick={skipSession}
                        title={isWorkSession ? "Skip work session" : "Skip break"}
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
                    className="todo-toggle-pomodoro"
                    onClick={onToggleTodo}
                    title={isTodoVisible ? "Hide Tasks" : "Show Tasks"}
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
        </div>
    )
}

export default Pomodoro;