import {create} from 'zustand'
import {devtools} from 'zustand/middleware'
import {Chat, Message, ToastMessage, AppState} from '@/types'
import {apiService} from '../services/apiService'
import {generateId} from '../utils/helpers'

interface AppStore extends AppState {
    initializeApp: () => Promise<void>

    createNewChat: () => Promise<void>
    loadChat: (chatId: string) => Promise<void>
    sendMessage: (content: string) => Promise<void>

    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void
    setCurrentChat: (chatId: string | null) => void

    addToast: (toast: Omit<ToastMessage, 'id'>) => void
    removeToast: (id: string) => void

    setLoading: (loading: boolean) => void
}

export const useAppStore = create<AppStore>()(
    devtools(
        (set, get) => ({
            // Initial state
            chats: [],
            currentChatId: null,
            isLoading: false,
            sidebarOpen: false,
            toasts: [],

            initializeApp: async () => {
                set({isLoading: true})
                try {
                    const chats = await apiService.getChats()
                    set({chats, isLoading: false})
                } catch (error) {
                    console.error('Failed to initialize app:', error)
                }
            },

            createNewChat: async () => {
                set({isLoading: true})
                try {
                    const newChat = await apiService.createChat('Новый чат')
                    const {chats} = get()
                    set({
                        chats: [newChat, ...chats],
                        currentChatId: newChat.id,
                        isLoading: false,
                        sidebarOpen: false,
                    })
                } catch (error) {
                    console.error('Failed to create chat:', error)
                    get().addToast({
                        type: 'error',
                        message: 'Не удалось создать новый чат'
                    })
                    set({isLoading: false})
                }
            },

            loadChat: async (chatId: string) => {
                set({isLoading: true, currentChatId: chatId})
                try {
                    const messages = await apiService.getChatMessages(chatId)
                    const {chats} = get()
                    const updatedChats = chats.map(chat =>
                        chat.id === chatId ? {...chat, messages} : chat
                    )
                    set({chats: updatedChats, isLoading: false, sidebarOpen: false})
                } catch (error) {
                    console.error('Failed to load chat:', error)
                    get().addToast({
                        type: 'error',
                        message: 'Не удалось загрузить чат'
                    })
                    set({isLoading: false})
                }
            },

            sendMessage: async (content: string) => {
                const {currentChatId, chats} = get()

                if (!content.trim()) return

                const userMessage: Message = {
                    id: generateId(),
                    author: 'customer',
                    content: content.trim(),
                    sent_at: Math.floor(Date.now() / 1000)
                }

                let targetChatId = currentChatId
                let updatedChats: Chat[]

                if (!targetChatId) {
                    const newChat: Chat = {
                        id: generateId(),
                        title: content.length > 30 ? content.substring(0, 30) + '...' : content,
                        messages: [userMessage],
                        lastMessage: content,
                        last_message_at: Math.floor(Date.now() / 1000),
                        started_at: Math.floor(Date.now() / 1000)
                    }
                    updatedChats = [newChat, ...chats]
                    targetChatId = newChat.id
                    set({currentChatId: targetChatId})
                } else {
                    updatedChats = chats.map(chat =>
                        chat.id === targetChatId
                            ? {
                                ...chat,
                                messages: [...(chat.messages || []), userMessage],
                                lastMessage: content,
                                last_message_at: Math.floor(Date.now() / 1000)
                            }
                            : chat
                    )
                }

                set({chats: updatedChats, isLoading: true})

                try {
                    await apiService.sendMessage(targetChatId, content)

                    const messages = await apiService.getChatMessages(targetChatId)

                    const finalChats = updatedChats.map(chat =>
                        chat.id === targetChatId
                            ? {
                                ...chat, 
                                messages: messages,
                                lastMessage: messages[messages.length - 1]?.content || content,
                                last_message_at: messages[messages.length - 1]?.sent_at || Math.floor(Date.now() / 1000)
                            }
                            : chat
                    )

                    set({chats: finalChats, isLoading: false})
                } catch (error) {
                    console.error('Failed to send message:', error)
                    get().addToast({
                        type: 'error',
                        message: 'Не удалось загрузить чат'
                    })
                    set({isLoading: false})
                }
            },

            toggleSidebar: () => set(state => ({sidebarOpen: !state.sidebarOpen})),
            setSidebarOpen: (open: boolean) => set({sidebarOpen: open}),
            setCurrentChat: (chatId: string | null) => set({currentChatId: chatId}),
            setLoading: (loading: boolean) => set({isLoading: loading}),

            addToast: (toast) => {
                const newToast: ToastMessage = {
                    ...toast,
                    id: generateId()
                }
                set(state => ({toasts: [...state.toasts, newToast]}))

                setTimeout(() => {
                    get().removeToast(newToast.id)
                }, toast.duration || 5000)
            },

            removeToast: (id: string) => {
                set(state => ({toasts: state.toasts.filter(t => t.id !== id)}))
            }
        }),
        {
            name: 'telegram-chat-app'
        }
    )
)
