import { useState, useRef, useEffect } from 'react';

export function useUndo() {
    const [undoableActions, setUndoableActions] = useState([]);
    const undoTimersRef = useRef({});

    // Generic undo function creator
    const createUndoAction = (type, data, actionText) => {
        const undoId = Date.now() + Math.random();
        const undoAction = {
            id: undoId,
            type: type,
            data: data,
            actionText: actionText,
            timestamp: Date.now(),
            timeLeft: 5000 // 5 seconds in milliseconds
        };

        // Add undo action
        setUndoableActions(prev => [...prev, undoAction]);

        // Set timer to remove undo option after 5 seconds
        const timer = setTimeout(() => {
            setUndoableActions(prev => prev.filter(action => action.id !== undoId));
            delete undoTimersRef.current[undoId];
        }, 5000);

        undoTimersRef.current[undoId] = timer;

        // Update time left every 100ms for smooth countdown
        const countdownInterval = setInterval(() => {
            setUndoableActions(prev =>
                prev.map(action => {
                    if (action.id === undoId) {
                        const newTimeLeft = Math.max(0, action.timeLeft - 100);
                        return { ...action, timeLeft: newTimeLeft };
                    }
                    return action;
                })
            );
        }, 100);

        // Clear countdown interval when timer expires
        setTimeout(() => {
            clearInterval(countdownInterval);
        }, 5000);
    };

    // Remove undo action and clear timer
    const removeUndoAction = (undoId) => {
        setUndoableActions(prev => prev.filter(a => a.id !== undoId));
        
        if (undoTimersRef.current[undoId]) {
            clearTimeout(undoTimersRef.current[undoId]);
            delete undoTimersRef.current[undoId];
        }
    };

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            Object.values(undoTimersRef.current).forEach(timer => clearTimeout(timer));
        };
    }, []);

    return {
        undoableActions,
        createUndoAction,
        removeUndoAction
    };
}