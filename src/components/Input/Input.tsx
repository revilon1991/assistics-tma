import {useState, useRef, useEffect} from 'react'
import {Send} from 'lucide-react'
import './Input.css'

interface InputProps {
    onSendMessage: (message: string) => Promise<void>
    disabled?: boolean
}

export function Input({onSendMessage, disabled = false}: InputProps) {
    const [message, setMessage] = useState('')
    const [isExpanded, setIsExpanded] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        adjustHeight()
    }, [message])

    useEffect(() => {
        // Инициализация Telegram WebApp viewport
        const tg = window.Telegram?.WebApp
        if (tg) {
            tg.expand()
        }
    }, [])

    const adjustHeight = () => {
        const textarea = textareaRef.current
        if (!textarea) return

        textarea.style.height = 'auto'
        const newHeight = Math.min(textarea.scrollHeight, 200)
        textarea.style.height = newHeight + 'px'

        setIsExpanded(newHeight > 48)
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
            // Возвращаем сообщение обратно при ошибке
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
        // Telegram WebApp автоматически обрабатывает появление клавиатуры
        setTimeout(() => {
            textareaRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 300)
    }

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
              placeholder="Введите ваше сообщение..."
              disabled={disabled}
              rows={1}
              className="message-textarea"
          />
                    <button
                        type="submit"
                        disabled={!message.trim() || disabled}
                        className="send-button"
                        aria-label="Отправить сообщение"
                    >
                        <Send size={20}/>
                    </button>
                </div>
            </form>
        </div>
    )
}
