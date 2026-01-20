import { useState, useEffect } from 'react';
import { useSound } from 'use-sound';
import { Plus, Trash2, Edit3, Check, Save, Target, RotateCcw, ChevronRight, ChevronLeft, ChevronUp, ChevronDown, X, Undo2, Search, Square } from 'lucide-react';
import './Todo.css';
import './TodoControls.css';

import doneSfx from '../../music/done.mp3';
import deleteSfx from '../../music/delete.mp3';

function Todo({ isPomodoroVisible = true, onTogglePomodoro }) {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [accomplishedTasks, setAccomplishedTasks] = useState([]);

    const [editingIndex, setEditingIndex] = useState(null);
    const [editValue, setEditValue] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [showAddTask, setShowAddTask] = useState(false);

    const [isActiveExpanded, setIsActiveExpanded] = useState(true);
    const [isCompletedExpanded, setIsCompletedExpanded] = useState(true);

    const [draggedIndex, setDraggedIndex] = useState(null);
    const [draggedOverIndex, setDraggedOverIndex] = useState(null);
    const [draggedCompletedIndex, setDraggedCompletedIndex] = useState(null);
    const [draggedOverCompletedIndex, setDraggedOverCompletedIndex] = useState(null);

    // create state for starting index
    const TASKS_PER_PAGE = 5; // change this to how many tasks you want per page
    const [currentPage, setCurrentPage] = useState(1);
    const [currentPageAccomplished, setCurrentPageAccomplished] = useState(1);

    // Add sort state
    const [sortBy, setSortBy] = useState('none'); // 'none', 'date-asc', 'date-desc'

    // Reset pagination when search term or sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortBy]);

    useEffect(() => {
        setCurrentPageAccomplished(1);
    }, [searchTerm, sortBy]);

    // Sort function
    const sortTasks = (taskList) => {
        if (sortBy === 'none') return taskList;

        return [...taskList].sort((a, b) => {
            if (sortBy === 'date-asc') {
                return a.date - b.date;
            } else if (sortBy === 'date-desc') {
                return b.date - a.date;
            }
            return 0;
        });
    };

    // Load tasks from localStorage on mount
    useEffect(() => {
        // ----- Removed this so that it persists accross days ----- //
        // const today = new Date().toDateString();
        // const savedDate = localStorage.getItem('todoro-date');

        // // Check if it's a new day - if so, clear all tasks
        // if (savedDate !== today) {
        //     localStorage.removeItem('todoro-tasks');
        //     localStorage.removeItem('todoro-accomplished');
        //     localStorage.setItem('todoro-date', today);
        //     setTasks([]);
        //     setAccomplishedTasks([]);
        //     return;
        // }
        // ---------------------------------------- //

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
            done: [950, 2000]
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
            const taskObject = {
                name: newTask,
                date: Date.now()
            };

            setTasks(t => [...t, taskObject]); // store task object
            setNewTask("");
            setShowAddTask(false);
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
            updatedTasks[index] = {
                ...updatedTasks[index],
                name: editValue.trim(),
                date: Date.now() // Update date to current timestamp when task is edited
            }; //updated this also to just update the name; to add set date to last edit
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

    // Handle drag start
    function handleDragStart(index) {
        setDraggedIndex(index);
    }

    // Handle drag over
    function handleDragOver(e, index) {
        e.preventDefault();
        setDraggedOverIndex(index);
    }

    // Handle drag end
    function handleDragEnd() {
        if (
            draggedIndex !== null &&
            draggedOverIndex !== null &&
            draggedIndex !== draggedOverIndex
        ) {
            const updatedTasks = [...tasks];
            const [draggedTask] = updatedTasks.splice(draggedIndex, 1);
            updatedTasks.splice(draggedOverIndex, 0, draggedTask);
            setTasks(updatedTasks);
        }
        setDraggedIndex(null);
        setDraggedOverIndex(null);
    }

    // Handle drag leave
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

    // Search and sort logic
    const filterTasks = (taskList) => {
        return taskList.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const sortedActiveTasks = sortTasks(tasks);
    const sortedCompletedTasks = sortTasks(accomplishedTasks);

    const displayedActiveTasks = filterTasks(sortedActiveTasks);
    const displayedCompletedTasks = filterTasks(sortedCompletedTasks);

    // Filter tasks based on search term
    const filteredTasksAccomplished = displayedCompletedTasks.filter(task =>
        task.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPagesAccomplished = Math.ceil(filteredTasksAccomplished.length / TASKS_PER_PAGE);
    const startIndexAccomplished = (currentPageAccomplished - 1) * TASKS_PER_PAGE;
    const endIndexAccomplished = startIndexAccomplished + TASKS_PER_PAGE;
    const paginatedTasksAccomplished = filteredTasksAccomplished.slice(startIndexAccomplished, endIndexAccomplished);

    // Filter tasks based on search term
    const filteredTasks = displayedActiveTasks.filter(task =>
        task.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination
    const totalPages = Math.ceil(filteredTasks.length / TASKS_PER_PAGE);
    const startIndex = (currentPage - 1) * TASKS_PER_PAGE;
    const endIndex = startIndex + TASKS_PER_PAGE;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

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

                <div className="search-section">
                    <div className="search-wrapper">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        {searchTerm && (
                            <button
                                className="clear-search-btn"
                                onClick={() => setSearchTerm("")}
                                title="Clear search"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <div className="sort-section">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="sort-select"
                        >
                            <option value="none">No sorting</option>
                            <option value="date-desc">Newest first</option>
                            <option value="date-asc">Oldest first</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="tasks-section">
                <div className="section-header">
                    <div className="section-header-left" onClick={() => setIsActiveExpanded(!isActiveExpanded)}>
                        <h3 className="section-title">
                            Active Tasks
                            <span className="task-badge">{displayedActiveTasks.length}</span>
                        </h3>
                    </div>
                    <div className="section-header-actions">
                        {!showAddTask && isActiveExpanded && (
                            <button
                                className="add-task-header-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAddTask(true);
                                }}
                                title="Add new task"
                            >
                                <Plus size={18} />
                            </button>
                        )}
                        <button
                            className="accordion-toggle"
                            onClick={() => {
                                setIsActiveExpanded(!isActiveExpanded);
                                if (isActiveExpanded) {
                                    setShowAddTask(false);
                                    setNewTask("");
                                }
                            }}
                            title={isActiveExpanded ? "Collapse" : "Expand"}
                        >
                            {isActiveExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                    </div>
                </div>
                <div className={`task-list ${isActiveExpanded ? 'expanded' : 'collapsed'}`}>
                    {showAddTask && isActiveExpanded && (
                        <div className="task-input-inline">
                            <input
                                type="text"
                                placeholder="What needs to be done?"
                                value={newTask}
                                onChange={handleInputChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') addTask();
                                    if (e.key === 'Escape') {
                                        setShowAddTask(false);
                                        setNewTask("");
                                    }
                                }}
                                className="task-input-field"
                                autoFocus
                            />
                            <button
                                className="add-btn-inline"
                                onClick={addTask}
                                disabled={!newTask.trim()}
                            >
                                <Plus size={20} />
                            </button>
                            <button
                                className="cancel-btn-inline"
                                onClick={() => {
                                    setShowAddTask(false);
                                    setNewTask("");
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}

                    {displayedActiveTasks.length === 0 && !showAddTask ? (
                        <div className="empty-state">
                            <Target size={48} className="empty-icon" />
                            <p>{searchTerm ? 'No matching tasks' : 'No active tasks. Click the + icon to get started!'}</p>
                        </div>
                    ) : (
                        paginatedTasks.map((task, paginatedIndex) => {
                            // Find the actual index in the original tasks array
                            const actualIndex = tasks.findIndex(t => t.name === task.name && t.date === task.date);

                            return (
                                <div
                                    key={`${task.name}-${task.date}`}
                                    className={`task-item ${draggedIndex === actualIndex ? 'dragging' : ''} ${draggedOverIndex === actualIndex ? 'drag-over' : ''}`}
                                    draggable={!searchTerm && editingIndex !== actualIndex && sortBy === 'none'}
                                    onDragStart={() => handleDragStart(actualIndex)}
                                    onDragOver={(e) => handleDragOver(e, actualIndex)}
                                    onDragEnd={handleDragEnd}
                                    onDragLeave={handleDragLeave}
                                >
                                    {editingIndex === actualIndex ? (
                                        <div className="edit-mode">
                                            <input
                                                className="edit-input"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        saveEdit(actualIndex);
                                                    } else if (e.key === 'Escape') {
                                                        setEditingIndex(null);
                                                    }
                                                }}
                                                autoFocus
                                            />
                                            <button
                                                className="action-btn save"
                                                onClick={() => saveEdit(actualIndex)}
                                            >
                                                <Save size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                className="action-btn complete checkbox-btn"
                                                onClick={() => completeTask(actualIndex)}
                                                title="Mark as complete"
                                            >
                                                <Square size={16} className="checkbox-icon unchecked" />
                                                <Check size={16} className="checkbox-icon checked" />
                                            </button>
                                            <span className="task-text">{task.name}</span>
                                            <div className="task-actions">
                                                <button
                                                    className="action-btn edit"
                                                    onClick={() => {
                                                        setEditingIndex(actualIndex);
                                                        setEditValue(task.name);
                                                    }}
                                                    title="Edit task"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    className="action-btn delete"
                                                    onClick={() => deleteTask(actualIndex)}
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

                    <div className="pagination-controls">
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </button>
                        <span className="pagination-info">
                            Page {currentPage} of {totalPages || 1}
                        </span>
                        <button
                            className="pagination-btn"
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>
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
                                <span>Clear Completed</span>
                            </button>
                            <button className="accordion-toggle" title={isCompletedExpanded ? "Collapse" : "Expand"}>
                                {isCompletedExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                        </div>
                    </div>
                    <div className={`completed-list ${isCompletedExpanded ? 'expanded' : 'collapsed'}`}>
                        {paginatedTasksAccomplished.map((doneTask, paginatedIndex) => {
                            // Find the actual index in the original accomplished tasks array
                            const actualIndex = accomplishedTasks.findIndex(t => t.name === doneTask.name && t.date === doneTask.date);

                            return (
                                <div
                                    key={`${doneTask.name}-${doneTask.date}`}
                                    className={`completed-item ${draggedCompletedIndex === actualIndex ? 'dragging' : ''} ${draggedOverCompletedIndex === actualIndex ? 'drag-over' : ''}`}
                                    draggable={!searchTerm && sortBy === 'none'}
                                    onDragStart={() => handleCompletedDragStart(actualIndex)}
                                    onDragOver={(e) => handleCompletedDragOver(e, actualIndex)}
                                    onDragEnd={handleCompletedDragEnd}
                                    onDragLeave={handleCompletedDragLeave}
                                >
                                    <Check size={16} className="completed-icon" />
                                    <span className="completed-text">{doneTask.name}</span>
                                    <div className="completed-actions">
                                        <button
                                            className="action-btn undo"
                                            onClick={() => markIncomplete(actualIndex)}
                                            title="Mark as incomplete"
                                        >
                                            <Undo2 size={16} />
                                        </button>
                                        <button
                                            className="action-btn delete"
                                            onClick={() => deleteAccomplishedTask(actualIndex)}
                                            title="Delete task"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                        <div className="pagination-controls">
                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPageAccomplished(p => Math.max(p - 1, 1))}
                                disabled={currentPageAccomplished === 1}
                            >
                                <ChevronLeft size={16} />
                                Previous
                            </button>
                            <span className="pagination-info">
                                Page {currentPageAccomplished} of {totalPagesAccomplished || 1}
                            </span>
                            <button
                                className="pagination-btn"
                                onClick={() => setCurrentPageAccomplished(p => Math.min(p + 1, totalPagesAccomplished))}
                                disabled={currentPageAccomplished === totalPagesAccomplished || totalPagesAccomplished === 0}
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="footer-actions">
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
    )
}

export default Todo;