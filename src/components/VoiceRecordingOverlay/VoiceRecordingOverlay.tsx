import {Mic, X} from 'lucide-react'
import './VoiceRecordingOverlay.css'

interface VoiceRecordingOverlayProps {
    isRecording: boolean
    onCancel?: () => void
}

export function VoiceRecordingOverlay({isRecording, onCancel}: VoiceRecordingOverlayProps) {
    if (!isRecording) return null

    return (
        <div className="voice-recording-overlay">
            {onCancel && (
                <button 
                    className="recording-close-button"
                    onClick={onCancel}
                    aria-label="Закрыть"
                >
                    <X size={24} />
                </button>
            )}
            <div className="recording-animation">
                <div className="recording-circle recording-circle-1"></div>
                <div className="recording-circle recording-circle-2"></div>
                <div className="recording-circle recording-circle-3"></div>
                <div className="recording-icon-container">
                    <Mic size={48} className="recording-icon" />
                </div>
            </div>
            <p className="recording-text">Идет запись...</p>
            <p className="recording-hint">Отпустите для отправки</p>
        </div>
    )
}

