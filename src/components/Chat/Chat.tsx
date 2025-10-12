import {useEffect, useRef} from 'react'
import {Bot, Menu, User, Trash2} from 'lucide-react'
import {useAppStore} from '@/stores/appStore'
import {Input} from '@/components/Input/Input'
import {formatTime} from '@/utils/helpers'
import '@/components/Chat/Chat.css'

export function Chat() {
    const {
        chats,
        currentChatId,
        isTyping,
        toggleSidebar,
        sendMessage,
        deleteChat
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

    const handleDeleteChat = async () => {
        if (!currentChatId) return
        
        if (confirm('Вы уверены, что хотите удалить этот чат?')) {
            await deleteChat(currentChatId)
        }
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
                <h1 className="chat-title">
                    {currentChat ? currentChat.title : 'Assistant Chat'}
                </h1>
                <div className="header-actions">
                    {currentChatId && (
                        <button
                            className="delete-chat-header-button"
                            onClick={handleDeleteChat}
                            aria-label="Удалить чат"
                        >
                            <Trash2 size={20}/>
                        </button>
                    )}
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

                        {isTyping && (
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

            <Input onSendMessage={handleSendMessage} disabled={isTyping}/>
        </div>
    )
}
