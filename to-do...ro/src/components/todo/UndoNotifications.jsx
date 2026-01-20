import { Check, Trash2, Edit3, Clock, Undo2, RotateCcw, Target } from 'lucide-react';
import './UndoNotifications.css';

function UndoNotifications({ undoableActions, onUndo }) {
    // Get appropriate icon based on action type
    const getActionIcon = (type) => {
        switch (type) {
            case 'complete':
                return <Check size={16} className="undo-icon" />;
            case 'delete':
            case 'deleteCompleted':
                return <Trash2 size={16} className="undo-icon" />;
            case 'edit':
                return <Edit3 size={16} className="undo-icon" />;
            case 'clearAll':
            case 'clearAccomplished':
                return <RotateCcw size={16} className="undo-icon" />;
            case 'markIncomplete':
                return <Target size={16} className="undo-icon" />;
            default:
                return <Check size={16} className="undo-icon" />;
        }
    };

    if (undoableActions.length === 0) {
        return null;
    }

    return (
        <div className="undo-notifications">
            {undoableActions.map(action => {
                // Map action types to CSS classes
                const getCssClass = (type) => {
                    switch (type) {
                        case 'deleteCompleted':
                            return 'delete';
                        case 'clearAll':
                        case 'clearAccomplished':
                            return 'clearAll';
                        case 'markIncomplete':
                            return 'markIncomplete';
                        default:
                            return type;
                    }
                };

                return (
                    <div 
                        key={action.id} 
                        className={`undo-notification undo-${getCssClass(action.type)}`}
                    >
                        <div className="undo-content">
                            {getActionIcon(action.type)}
                            <span className="undo-text">
                                {action.actionText}
                            </span>
                            <div className="undo-timer">
                                <Clock size={14} />
                                <span>{Math.ceil(action.timeLeft / 1000)}s</span>
                            </div>
                        </div>
                        <button
                            className="undo-btn"
                            onClick={() => onUndo(action.id)}
                            title={`Undo ${action.type}`}
                        >
                            <Undo2 size={16} />
                            Undo
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

export default UndoNotifications;