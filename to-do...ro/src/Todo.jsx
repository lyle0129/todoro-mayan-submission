import { useState, useEffect } from 'react';
import { useSound } from 'use-sound';
import { Plus, Trash2, Edit3, Check, Save, Target, RotateCcw } from 'lucide-react';

import doneSfx from './music/done.mp3';
import deleteSfx from './music/delete.mp3';

function Todo() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [accomplishedTasks, setAccomplishedTasks] = useState([]);

    const [editingIndex, setEditingIndex] = useState(null);
    const [editValue, setEditValue] = useState("");

    // Load tasks from localStorage on mount
    useEffect(() => {
        const today = new Date().toDateString();
        const savedDate = localStorage.getItem('todoro-date');

        // Check if it's a new day - if so, clear all tasks
        if (savedDate !== today) {
            localStorage.removeItem('todoro-tasks');
            localStorage.removeItem('todoro-accomplished');
            localStorage.setItem('todoro-date', today);
            setTasks([]);
            setAccomplishedTasks([]);
            return;
        }

        const savedTasks = localStorage.getItem('todoro-tasks');
        const savedAccomplished = localStorage.getItem('todoro-accomplished');

        if (savedTasks) {
            try {
                const parsed = JSON.parse(savedTasks);
                setTasks(parsed);
            } catch (e) {
                console.error('Failed to parse saved tasks');
            }
        }

        if (savedAccomplished) {
            try {
                const parsed = JSON.parse(savedAccomplished);
                setAccomplishedTasks(parsed);
            } catch (e) {
                console.error('Failed to parse saved accomplished tasks');
            }
        }
    }, []);

    // Save tasks to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('todoro-tasks', JSON.stringify(tasks));
    }, [tasks]);

    // Save accomplished tasks to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('todoro-accomplished', JSON.stringify(accomplishedTasks));
    }, [accomplishedTasks]);

    // load sounds with advanced timing
    const [playDone] = useSound(doneSfx, {
        volume: 0.5,
        sprite: {
            done: [150, 2000]
        }
    });
    const [playDelete] = useSound(deleteSfx, {
        volume: 0.5,
        sprite: {
            delete: [500, 250]
        }
    });

    function handleInputChange(event) {
        setNewTask(event.target.value);
    }

    function addTask() {
        if (newTask.trim() !== "") {
            setTasks(t => [...t, newTask]);
            setNewTask("");
        }
    }

    function deleteTask(index) {
        playDelete({ id: 'delete' });
        const updatedTasks = tasks.filter((_, i) => i !== index)
        setTasks(updatedTasks);
    }

    function completeTask(index) {
        playDone({ id: 'done' });
        const taskCompleted = tasks[index];
        setAccomplishedTasks(a => [...a, taskCompleted]);
        const updatedTasks = tasks.filter((_, i) => i !== index)
        setTasks(updatedTasks);
    }

    function saveEdit(index) {
        if (editValue.trim() !== "") {
            const updatedTasks = [...tasks];
            updatedTasks[index] = editValue.trim();
            setTasks(updatedTasks);
        }
        setEditingIndex(null);
    }

    function clearAllTasks() {
        setTasks([]);
        setAccomplishedTasks([]);
        localStorage.removeItem('todoro-tasks');
        localStorage.removeItem('todoro-accomplished');
    }

    const completionPercentage = ((accomplishedTasks.length / (tasks.length + accomplishedTasks.length)) * 100) || 0;

    return (
        <div className="todo-container">
            <div className="todo-header">
                <div className="progress-section">
                    <div className="progress-info">
                        <Target className="progress-icon" />
                        <span className="progress-text">
                            {completionPercentage.toFixed(0)}% Complete
                        </span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${completionPercentage}%` }}
                        ></div>
                    </div>
                    <div className="task-count">
                        {accomplishedTasks.length} of {tasks.length + accomplishedTasks.length} tasks done
                    </div>
                </div>

                {(tasks.length > 0 || accomplishedTasks.length > 0) && (
                    <button
                        className="clear-all-btn"
                        onClick={clearAllTasks}
                        title="Clear all tasks"
                    >
                        <RotateCcw size={16} />
                        Clear All
                    </button>
                )}
            </div>

            <div className="task-input-section">
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="What needs to be done?"
                        value={newTask}
                        onChange={handleInputChange}
                        onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        className="task-input"
                    />
                    <button
                        className="add-btn"
                        onClick={addTask}
                        disabled={!newTask.trim()}
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>

            <div className="tasks-section">
                <h3 className="section-title">Active Tasks</h3>
                <div className="task-list">
                    {tasks.length === 0 ? (
                        <div className="empty-state">
                            <Target size={48} className="empty-icon" />
                            <p>No active tasks. Add one above!</p>
                        </div>
                    ) : (
                        tasks.map((task, index) => (
                            <div key={index} className="task-item">
                                {editingIndex === index ? (
                                    <div className="edit-mode">
                                        <input
                                            className="edit-input"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    saveEdit(index);
                                                } else if (e.key === 'Escape') {
                                                    setEditingIndex(null);
                                                }
                                            }}
                                            autoFocus
                                        />
                                        <button
                                            className="action-btn save"
                                            onClick={() => saveEdit(index)}
                                        >
                                            <Save size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="task-text">{task}</span>
                                        <div className="task-actions">
                                            <button
                                                className="action-btn complete"
                                                onClick={() => completeTask(index)}
                                                title="Mark as complete"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                className="action-btn edit"
                                                onClick={() => {
                                                    setEditingIndex(index);
                                                    setEditValue(task);
                                                }}
                                                title="Edit task"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => deleteTask(index)}
                                                title="Delete task"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {accomplishedTasks.length > 0 && (
                <div className="completed-section">
                    <h3 className="section-title completed">Completed Tasks</h3>
                    <div className="completed-list">
                        {accomplishedTasks.map((doneTask, index) => (
                            <div key={index} className="completed-item">
                                <Check size={16} className="completed-icon" />
                                <span className="completed-text">{doneTask}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Todo;