import {MessageCircle, Plus, X} from 'lucide-react'
import {useAppStore} from '@/stores/appStore'
import {formatDate, truncateText} from '@/utils/helpers'
import '@/components/Sidebar/Sidebar.css'

export function Sidebar() {
    const {
        chats,
        currentChatId,
        sidebarOpen,
        setSidebarOpen,
        createNewChat,
        setCurrentChat,
        loadChat
    } = useAppStore()

    const handleChatClick = async (chatId: string) => {
        if (chatId === currentChatId) {
            setSidebarOpen(false)
            return
        }

        setCurrentChat(chatId)
        await loadChat(chatId)
    }

    const handleNewChat = async () => {
        await createNewChat()
    }

    const handleOverlayClick = () => {
        setSidebarOpen(false)
    }

    return (
        <>
            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={handleOverlayClick}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <header className="sidebar-header">
                    <h2 className="sidebar-title">История чатов</h2>
                    <button
                        className="close-button"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Закрыть меню"
                    >
                        <X size={20}/>
                    </button>
                </header>

                <div className="sidebar-content">
                    <button
                        className="new-chat-button"
                        onClick={handleNewChat}
                    >
                        <Plus size={16}/>
                        Новый чат
                    </button>

                    <div className="chat-list">
                        {chats.length === 0 ? (
                            <div className="empty-state">
                                <MessageCircle size={32} className="empty-icon"/>
                                <p>Пока нет чатов</p>
                                <span>Создайте первый чат, чтобы начать общение</span>
                            </div>
                        ) : (
                            chats.map((chat) => (
                                <button
                                    key={chat.id}
                                    className={`chat-item ${chat.id === currentChatId ? 'active' : ''}`}
                                    onClick={() => handleChatClick(chat.id)}
                                >
                                    <div className="chat-info">
                                        <div className="chat-title">
                                            {truncateText(chat.title, 30)}
                                        </div>
                                        {chat.lastMessage && (
                                            <div className="chat-preview">
                                                {truncateText(chat.lastMessage, 50)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="chat-meta">
                                        <div className="chat-date">
                                            {formatDate(chat.last_message_at)}
                                        </div>
                                        {(chat.message_count !== undefined && chat.message_count > 0) && (
                                            <div className="message-count">
                                                {chat.message_count}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </aside>
        </>
    )
}
