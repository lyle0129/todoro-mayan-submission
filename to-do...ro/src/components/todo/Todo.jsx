import { useState, useEffect } from 'react';
import { useSound } from 'use-sound';
import { Plus, Trash2, Edit3, Check, Save, Target, RotateCcw, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, X, Undo2 } from 'lucide-react';
import TaskFilter from './TaskFilter.jsx';
import './Todo.css';

import doneSfx from '../../music/done.mp3';
import deleteSfx from '../../music/delete.mp3';

function Todo({ isPomodoroVisible = true, onTogglePomodoro }) {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [accomplishedTasks, setAccomplishedTasks] = useState([]);

    const [editingIndex, setEditingIndex] = useState(null);
    const [editValue, setEditValue] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [isActiveExpanded, setIsActiveExpanded] = useState(true);
    const [isCompletedExpanded, setIsCompletedExpanded] = useState(true);

    const [draggedIndex, setDraggedIndex] = useState(null);
    const [draggedOverIndex, setDraggedOverIndex] = useState(null);
    const [draggedCompletedIndex, setDraggedCompletedIndex] = useState(null);
    const [draggedOverCompletedIndex, setDraggedOverCompletedIndex] = useState(null);

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

    function markIncomplete(index) {
        const taskToRestore = accomplishedTasks[index];
        setTasks(t => [...t, taskToRestore]);
        const updatedAccomplished = accomplishedTasks.filter((_, i) => i !== index);
        setAccomplishedTasks(updatedAccomplished);
    }

    function deleteAccomplishedTask(index) {
        playDelete({ id: 'delete' });
        const updatedAccomplished = accomplishedTasks.filter((_, i) => i !== index);
        setAccomplishedTasks(updatedAccomplished);
    }

    function clearAllAccomplished() {
        setAccomplishedTasks([]);
        localStorage.removeItem('todoro-accomplished');
    }

    function handleDragStart(index) {
        setDraggedIndex(index);
    }

    function handleDragOver(e, index) {
        e.preventDefault();
        setDraggedOverIndex(index);
    }

    function handleDragEnd() {
        if (draggedIndex !== null && draggedOverIndex !== null && draggedIndex !== draggedOverIndex) {
            const updatedTasks = [...tasks];
            const [draggedTask] = updatedTasks.splice(draggedIndex, 1);
            updatedTasks.splice(draggedOverIndex, 0, draggedTask);
            setTasks(updatedTasks);
        }
        setDraggedIndex(null);
        setDraggedOverIndex(null);
    }

    function handleDragLeave() {
        setDraggedOverIndex(null);
    }

    function handleCompletedDragStart(index) {
        setDraggedCompletedIndex(index);
    }

    function handleCompletedDragOver(e, index) {
        e.preventDefault();
        setDraggedOverCompletedIndex(index);
    }

    function handleCompletedDragEnd() {
        if (draggedCompletedIndex !== null && draggedOverCompletedIndex !== null && draggedCompletedIndex !== draggedOverCompletedIndex) {
            const updatedAccomplished = [...accomplishedTasks];
            const [draggedTask] = updatedAccomplished.splice(draggedCompletedIndex, 1);
            updatedAccomplished.splice(draggedOverCompletedIndex, 0, draggedTask);
            setAccomplishedTasks(updatedAccomplished);
        }
        setDraggedCompletedIndex(null);
        setDraggedOverCompletedIndex(null);
    }

    function handleCompletedDragLeave() {
        setDraggedOverCompletedIndex(null);
    }

    const completionPercentage = ((accomplishedTasks.length / (tasks.length + accomplishedTasks.length)) * 100) || 0;

    // Search logic
    const filterTasks = (taskList) => {
        return taskList.filter(task =>
            task.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const displayedActiveTasks = filterTasks(tasks);
    const displayedCompletedTasks = filterTasks(accomplishedTasks);

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

                <div className="header-actions">
                    <button
                        className="pomodoro-toggle-btn"
                        onClick={onTogglePomodoro}
                        title={isPomodoroVisible ? "Hide Timer" : "Show Timer"}
                    >
                        <span className="toggle-text">Timer</span>
                        <span className="toggle-icon-desktop">
                            {isPomodoroVisible ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                        </span>
                        <span className="toggle-icon-mobile">
                            {isPomodoroVisible ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                        </span>
                    </button>

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

            <TaskFilter
                onSearchChange={setSearchTerm}
            />

            <div className="tasks-section">
                <div className="section-header" onClick={() => setIsActiveExpanded(!isActiveExpanded)}>
                    <h3 className="section-title">
                        Active Tasks
                        <span className="task-badge">{displayedActiveTasks.length}</span>
                    </h3>
                    <button className="accordion-toggle" title={isActiveExpanded ? "Collapse" : "Expand"}>
                        {isActiveExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>
                <div className={`task-list ${isActiveExpanded ? 'expanded' : 'collapsed'}`}>
                    {displayedActiveTasks.length === 0 ? (
                        <div className="empty-state">
                            <Target size={48} className="empty-icon" />
                            <p>{searchTerm ? 'No matching tasks' : 'No active tasks. Add one above!'}</p>
                        </div>
                    ) : (
                        displayedActiveTasks.map((task) => {
                            const originalIndex = tasks.indexOf(task);
                            return (
                                <div
                                    key={originalIndex}
                                    className={`task-item ${draggedIndex === originalIndex ? 'dragging' : ''} ${draggedOverIndex === originalIndex ? 'drag-over' : ''}`}
                                    draggable={!searchTerm && editingIndex !== originalIndex}
                                    onDragStart={() => handleDragStart(originalIndex)}
                                    onDragOver={(e) => handleDragOver(e, originalIndex)}
                                    onDragEnd={handleDragEnd}
                                    onDragLeave={handleDragLeave}
                                >
                                    {editingIndex === originalIndex ? (
                                        <div className="edit-mode">
                                            <input
                                                className="edit-input"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        saveEdit(originalIndex);
                                                    } else if (e.key === 'Escape') {
                                                        setEditingIndex(null);
                                                    }
                                                }}
                                                autoFocus
                                            />
                                            <button
                                                className="action-btn save"
                                                onClick={() => saveEdit(originalIndex)}
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
                                                    onClick={() => completeTask(originalIndex)}
                                                    title="Mark as complete"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    className="action-btn edit"
                                                    onClick={() => {
                                                        setEditingIndex(originalIndex);
                                                        setEditValue(task);
                                                    }}
                                                    title="Edit task"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    className="action-btn delete"
                                                    onClick={() => deleteTask(originalIndex)}
                                                    title="Delete task"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {displayedCompletedTasks.length > 0 && (
                <div className="completed-section">
                    <div className="section-header" onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}>
                        <h3 className="section-title completed">
                            Completed Tasks
                            <span className="task-badge completed">{displayedCompletedTasks.length}</span>
                        </h3>
                        <div className="completed-header-actions">
                            <button
                                className="clear-accomplished-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearAllAccomplished();
                                }}
                                title="Delete all completed tasks"
                            >
                                <Trash2 size={16} />
                                Clear Completed
                            </button>
                            <button className="accordion-toggle" title={isCompletedExpanded ? "Collapse" : "Expand"}>
                                {isCompletedExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                        </div>
                    </div>
                    <div className={`completed-list ${isCompletedExpanded ? 'expanded' : 'collapsed'}`}>
                        {displayedCompletedTasks.map((doneTask) => {
                            const originalIndex = accomplishedTasks.indexOf(doneTask);
                            return (
                                <div 
                                    key={originalIndex} 
                                    className={`completed-item ${draggedCompletedIndex === originalIndex ? 'dragging' : ''} ${draggedOverCompletedIndex === originalIndex ? 'drag-over' : ''}`}
                                    draggable={!searchTerm}
                                    onDragStart={() => handleCompletedDragStart(originalIndex)}
                                    onDragOver={(e) => handleCompletedDragOver(e, originalIndex)}
                                    onDragEnd={handleCompletedDragEnd}
                                    onDragLeave={handleCompletedDragLeave}
                                >
                                    <Check size={16} className="completed-icon" />
                                    <span className="completed-text">{doneTask}</span>
                                    <div className="completed-actions">
                                        <button
                                            className="action-btn undo"
                                            onClick={() => markIncomplete(originalIndex)}
                                            title="Mark as incomplete"
                                        >
                                            <Undo2 size={16} />
                                        </button>
                                        <button
                                            className="action-btn delete"
                                            onClick={() => deleteAccomplishedTask(originalIndex)}
                                            title="Delete task"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Todo;