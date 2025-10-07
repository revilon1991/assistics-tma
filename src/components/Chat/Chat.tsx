import {useEffect, useRef} from 'react'
import {Menu, User, Bot} from 'lucide-react'
import {useAppStore} from '../../stores/appStore'
import {Input} from '../Input/Input'
import {formatTime} from '@/utils/helpers'
import './Chat.css'

export function Chat() {
    const {
        chats,
        currentChatId,
        isLoading,
        toggleSidebar,
        sendMessage
    } = useAppStore()

    const messagesEndRef = useRef<HTMLDivElement>(null)

    const currentChat = chats.find(chat => chat.id === currentChatId)

    useEffect(() => {
        scrollToBottom()
    }, [currentChat?.messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
    }

    const handleSendMessage = async (content: string) => {
        await sendMessage(content)
    }

    return (
        <div className="chat">
            <header className="chat-header">
                <button
                    className="menu-button"
                    onClick={toggleSidebar}
                    aria-label="Открыть меню"
                >
                    <Menu size={20}/>
                </button>
                <h1 className="chat-title">Assistant Chat</h1>
                <div className="user-info">
                    {/* Здесь будет информация о пользователе из Telegram */}
                </div>
            </header>

            <div className="chat-messages">
                {!currentChat ? (
                    <div className="welcome-screen">
                        <div className="welcome-content">
                            <Bot size={48} className="welcome-icon"/>
                            <h2>Добро пожаловать!</h2>
                            <p>Начните новый разговор, отправив сообщение ниже.</p>
                        </div>
                    </div>
                ) : (currentChat.messages || []).length === 0 ? (
                    <div className="welcome-screen">
                        <div className="welcome-content">
                            <Bot size={48} className="welcome-icon"/>
                            <h2>Новый чат начат!</h2>
                            <p>Отправьте первое сообщение, чтобы начать разговор.</p>
                        </div>
                    </div>
                ) : (
                    <div className="messages-list">
                        {(currentChat.messages || []).map((message) => (
                            <div
                                key={message.id}
                                className={`message ${message.author}`}
                            >
                                <div className="message-avatar">
                                    {message.author === 'customer' ? (
                                        <User size={16}/>
                                    ) : (
                                        <Bot size={16}/>
                                    )}
                                </div>
                                <div className="message-content">
                                    <div className="message-text">{message.content}</div>
                                    <div className="message-time">
                                        {formatTime(message.sent_at)}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="message assistant">
                                <div className="message-avatar">
                                    <Bot size={16}/>
                                </div>
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span>Печатает</span>
                                        <div className="typing-dots">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef}/>
                    </div>
                )}
            </div>

            <Input onSendMessage={handleSendMessage} disabled={isLoading}/>
        </div>
    )
}
