import {useEffect, useRef, useState} from 'react'
import {Send, Mic} from 'lucide-react'
import '@/components/Input/Input.css'
import {expandViewport} from '@telegram-apps/sdk';
import {useAudioRecorder} from 'react-audio-voice-recorder'

interface InputProps {
    onSendMessage: (message: string) => Promise<void>
    onSendVoiceMessage?: (audioBlob: Blob) => Promise<void>
    onRecordingStateChange?: (isRecording: boolean) => void
    disabled?: boolean
    isTyping?: boolean
}

export function Input({onSendMessage, onSendVoiceMessage, onRecordingStateChange, disabled = false, isTyping = false}: InputProps) {
    const [message, setMessage] = useState('')
    const [isExpanded, setIsExpanded] = useState(false)
    const [isAtMaxHeight, setIsAtMaxHeight] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    
    const [permissionDenied, setPermissionDenied] = useState(false)
    const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown')

    const recorderControls = useAudioRecorder(
        {},
        (err) => {
            console.error('Audio recorder error:', err)
            setIsRecording(false)
            onRecordingStateChange?.(false)
            
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setPermissionDenied(true)
                setMicrophonePermission('denied')
                console.error('Доступ к микрофону запрещен')
            }
        }
    )

    useEffect(() => {
        const checkMicrophonePermission = async () => {
            try {
                if ('permissions' in navigator && navigator.permissions) {
                    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName })
                    setMicrophonePermission(result.state as 'granted' | 'denied' | 'prompt')
                    
                    if (result.state === 'denied') {
                        setPermissionDenied(true)
                    }
                    
                    result.addEventListener('change', () => {
                        setMicrophonePermission(result.state as 'granted' | 'denied' | 'prompt')
                        setPermissionDenied(result.state === 'denied')
                    })
                } else if ('mediaDevices' in navigator && navigator.mediaDevices?.getUserMedia) {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                    setMicrophonePermission('granted')
                    setPermissionDenied(false)
                    stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
                }
            } catch (error) {
                console.log('Не удалось проверить разрешение микрофона:', error)
                if (error instanceof Error && error.name === 'NotAllowedError') {
                    setMicrophonePermission('denied')
                    setPermissionDenied(true)
                } else {
                    setMicrophonePermission('prompt')
                }
            }
        }

        checkMicrophonePermission()
    }, [])

    useEffect(() => {
        adjustHeight()
    }, [message])

    useEffect(() => {
        if (expandViewport.isAvailable()) {
            expandViewport()
        }
    }, [])

    const adjustHeight = () => {
        const textarea = textareaRef.current
        if (!textarea) return

        textarea.style.height = 'auto'
        const newHeight = Math.min(textarea.scrollHeight, 200)
        textarea.style.height = newHeight + 'px'

        setIsExpanded(newHeight > 48)
        setIsAtMaxHeight(textarea.scrollHeight > 200)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const trimmedMessage = message.trim()
        if (!trimmedMessage || disabled) return

        setMessage('')

        try {
            await onSendMessage(trimmedMessage)
        } catch (error) {
            console.error('Failed to send message:', error)
            setMessage(trimmedMessage)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    const handleFocus = () => {
        setTimeout(() => {
            textareaRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 300)
    }

    const handleVoiceRecordStart = async () => {
        if (disabled || !onSendVoiceMessage) return
        
        if (microphonePermission === 'denied') {
            setPermissionDenied(true)
            return
        }
        
        if (microphonePermission === 'unknown' || microphonePermission === 'prompt') {
            try {
                if ('mediaDevices' in navigator && navigator.mediaDevices?.getUserMedia) {
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                    stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
                    setMicrophonePermission('granted')
                    setPermissionDenied(false)
                    return
                } else {
                    setMicrophonePermission('denied')
                    setPermissionDenied(true)
                    return
                }
            } catch (error) {
                setMicrophonePermission('denied')
                setPermissionDenied(true)
                return
            }
        }
        
        try {
            setIsRecording(true)
            onRecordingStateChange?.(true)
            await recorderControls.startRecording()
        } catch (error) {
            console.error('Не удалось начать запись:', error)
            setIsRecording(false)
            onRecordingStateChange?.(false)
            
            if (error instanceof Error) {
                if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                    setPermissionDenied(true)
                    setMicrophonePermission('denied')
                }
            }
        }
    }

    const handleVoiceRecordStop = async () => {
        if (!isRecording) return
        
        setIsRecording(false)
        onRecordingStateChange?.(false)
        
        try {
            recorderControls.stopRecording()
        } catch (error) {
            console.error('Ошибка при остановке записи:', error)
        }
    }
    
    useEffect(() => {
        if (!isRecording && recorderControls.isRecording) {
            try {
                recorderControls.stopRecording()
            } catch (error) {
                console.error('Ошибка при принудительной остановке:', error)
            }
        }
    }, [isRecording, recorderControls])

    const lastProcessedBlobRef = useRef<Blob | null>(null)
    const isSendingRef = useRef(false)

    useEffect(() => {
        if (recorderControls.recordingBlob && 
            onSendVoiceMessage && 
            recorderControls.recordingBlob !== lastProcessedBlobRef.current &&
            !isSendingRef.current) {
            
            const blob = recorderControls.recordingBlob
            
            lastProcessedBlobRef.current = blob
            
            console.log('Получен blob:', {
                size: blob.size,
                type: blob.type
            })
            
            const MIN_BLOB_SIZE = 5 * 1024
            
            if (blob.size < MIN_BLOB_SIZE) {
                console.log(`Blob слишком маленький (${blob.size} байт), пропускаем отправку`)
                setIsRecording(false)
                onRecordingStateChange?.(false)
                return
            }
            
            if (blob.size > 0) {
                isSendingRef.current = true
                setIsRecording(false)
                onRecordingStateChange?.(false)
                
                onSendVoiceMessage(blob)
                    .finally(() => {
                        isSendingRef.current = false
                    })
            } else {
                setIsRecording(false)
                onRecordingStateChange?.(false)
            }
        }
    }, [recorderControls.recordingBlob, onSendVoiceMessage, onRecordingStateChange])

    const handleMouseDown = () => {
        if (!message.trim() && !permissionDenied) {
            handleVoiceRecordStart()
        }
    }

    const handleMouseUp = () => {
        if (isRecording) {
            handleVoiceRecordStop()
        }
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        e.preventDefault()
        if (!message.trim() && !permissionDenied) {
            handleVoiceRecordStart()
        }
    }

    const handleTouchEnd = (e: React.TouchEvent) => {
        e.preventDefault()
        if (isRecording) {
            handleVoiceRecordStop()
        }
    }
    
    useEffect(() => {
        if (message.trim() && microphonePermission !== 'denied') {
            setPermissionDenied(false)
        }
    }, [message, microphonePermission])

    return (
        <div className={`input-container ${isExpanded ? 'expanded' : ''}`}>
            <form onSubmit={handleSubmit} className="input-form">
                <div className="input-wrapper">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={handleFocus}
                        placeholder={
                            isTyping ? "Отправка..." :
                            permissionDenied ? "Разрешите доступ к микрофону для записи голоса" :
                            "Введите ваше сообщение..."
                        }
                        disabled={disabled || isTyping}
                        rows={1}
                        className={`message-textarea ${isAtMaxHeight ? 'scrollable' : ''}`}
                    />
                    {message.trim() ? (
                        <button
                            type="submit"
                            disabled={disabled || isTyping}
                            className="send-button"
                            aria-label="Отправить сообщение"
                        >
                            <Send size={20}/>
                        </button>
                    ) : (
                        <button
                            type="button"
                            disabled={disabled || isTyping || permissionDenied}
                            className={`voice-button ${isRecording ? 'recording' : ''} ${permissionDenied ? 'permission-denied' : ''}`}
                            aria-label={permissionDenied ? "Доступ к микрофону запрещен" : "Удерживайте для записи голосового сообщения"}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                        >
                            <Mic size={20}/>
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}
