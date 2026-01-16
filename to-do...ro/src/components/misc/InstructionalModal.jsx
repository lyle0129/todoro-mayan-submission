import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { instructionsData } from '../../instructionsData.js';
import './InstructionalModal.css';

function InstructionalModal({ isOpen, onClose, isFromSettings = false }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [imageErrors, setImageErrors] = useState({});

    const currentInstruction = instructionsData[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === instructionsData.length - 1;

    // Determine if the media is a video or image
    const getMediaType = (mediaPath) => {
        if (!mediaPath) return null;
        // Check if the path contains video extensions
        const pathStr = typeof mediaPath === 'string' ? mediaPath : String(mediaPath);
        return pathStr.match(/\.(mp4|webm|ogg)(\?|$)/i) ? 'video' : 'image';
    };

    // Handle media load errors
    const handleMediaError = (stepId) => {
        setImageErrors(prev => ({ ...prev, [stepId]: true }));
    };

    const handleNext = () => {
        if (!isLastStep) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (!isFirstStep) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleClose = () => {
        if (!isFromSettings) {
            // Mark as seen in localStorage only if this is the first-time visit
            localStorage.setItem('todoro-instructions-seen', 'true');
        }
        setCurrentStep(0); // Reset to first step for next time
        onClose();
    };

    const handleSkip = () => {
        handleClose();
    };

    // Reset step when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
            setImageErrors({});
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="instructions-overlay">
            <div className="instructions-modal">
                <div className="instructions-header">
                    <div className="step-indicator">
                        <span className="step-text">
                            Step {currentStep + 1} of {instructionsData.length}
                        </span>
                        <div className="step-dots">
                            {instructionsData.map((_, index) => (
                                <div
                                    key={index}
                                    className={`step-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                    <button className="instructions-close-btn" onClick={handleClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="instructions-content">
                    <div className={`instruction-step ${currentInstruction.id === 5 ? 'video-above' : ''}`}>
                        {currentInstruction.image && !imageErrors[currentInstruction.id] && (
                            <div className="instruction-image">
                                {getMediaType(currentInstruction.image) === 'video' ? (
                                    <video
                                        key={`video-${currentStep}`}
                                        src={currentInstruction.image}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        onError={() => handleMediaError(currentInstruction.id)}
                                    />
                                ) : (
                                    <img
                                        src={currentInstruction.image}
                                        alt={currentInstruction.title}
                                        onError={() => handleMediaError(currentInstruction.id)}
                                    />
                                )}
                            </div>
                        )}

                        <div className={`instruction-text ${!currentInstruction.image || imageErrors[currentInstruction.id] ? 'full-width' : ''}`}>
                            <h2 className="instruction-title">{currentInstruction.title}</h2>
                            <p className="instruction-description">{currentInstruction.content}</p>
                        </div>
                    </div>
                </div>

                <div className="instructions-footer">
                    <div className="footer-left">
                        {!isFromSettings && (
                            <button className="skip-btn" onClick={handleSkip}>
                                Skip Tutorial
                            </button>
                        )}
                    </div>

                    <div className="footer-navigation">
                        <button
                            className="nav-btn prev-btn"
                            onClick={handlePrevious}
                            disabled={isFirstStep}
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </button>

                        {isLastStep ? (
                            <button className="nav-btn finish-btn" onClick={handleClose}>
                                {isFromSettings ? 'Close' : 'Get Started'}
                            </button>
                        ) : (
                            <button className="nav-btn next-btn" onClick={handleNext}>
                                Next
                                <ChevronRight size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InstructionalModal;
