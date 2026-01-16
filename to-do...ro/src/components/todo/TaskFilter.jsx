import { useState } from 'react';
import { Search, X } from 'lucide-react';
import './TaskFilter.css';

function TaskFilter({ onSearchChange }) {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearchChange(value);
    };

    const clearSearch = () => {
        setSearchTerm("");
        onSearchChange("");
    };

    return (
        <div className="task-filter-container">
            <div className="search-box">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                />
                {searchTerm && (
                    <button
                        className="clear-search-btn"
                        onClick={clearSearch}
                        title="Clear search"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        </div>
    );
}

export default TaskFilter;
