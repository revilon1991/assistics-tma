import {create} from 'zustand'
import {devtools} from 'zustand/middleware'
import {AppState, Chat, Message, ToastMessage, AuthTokens, UpdateCustomerRequest} from '@/types'
import {apiService} from '@/services/apiService'
import {authService} from '@/services/authService'
import {generateId, uuidV7} from '@/utils/helpers'
import {retrieveRawInitData} from '@telegram-apps/bridge';
import {parseInitDataQuery} from '@telegram-apps/transformers';
import type {User} from '@telegram-apps/types';

interface AppStore extends AppState {
    initializeApp: () => Promise<void>
    authenticate: () => Promise<void>
    updateCustomerInfo: () => Promise<void>

    createNewChat: () => Promise<void>
    loadChat: (chatId: string) => Promise<void>
    sendMessage: (content: string) => Promise<void>
    sendVoiceMessage: (audioBlob: Blob) => Promise<void>
    deleteChat: (chatId: string) => Promise<void>

    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void
    setCurrentChat: (chatId: string | null) => void

    addToast: (toast: Omit<ToastMessage, 'id'>) => void
    removeToast: (id: string) => void

    setLoading: (loading: boolean) => void
    setTyping: (typing: boolean) => void
    setAuthTokens: (tokens: AuthTokens | null) => void
    setIsAuthenticated: (authenticated: boolean) => void
}

export const useAppStore = create<AppStore>()(
    devtools(
        (set, get) => ({
            tmaInitData: '',
            chats: [],
            currentChatId: null,
            isLoading: false,
            isTyping: false,
            sidebarOpen: false,
            toasts: [],
            authTokens: null,
            isAuthenticated: false,

            initializeApp: async () => {
                set({isLoading: true})

                const tmaInitData = retrieveRawInitData() || ''

                set({tmaInitData: tmaInitData})

                authService.setTmaInitData(tmaInitData)

                try {
                    const isAuth = await authService.isAuthenticated()
                    if (!isAuth) {
                        await get().authenticate()
                    }

                    get().updateCustomerInfo().catch(error => {
                        console.error('Failed to update customer info:', error)
                    })

                    const chats = await apiService.getChats()
                    set({chats, isLoading: false})
                } catch (error) {
                    console.error('Failed to initialize app:', error)
                    get().addToast({
                        type: 'error',
                        message: 'Не удалось инициализировать приложение. Пожалуйста, перезапустите приложение'
                    })
                    set({isLoading: false})
                }
            },

            authenticate: async () => {
                const {tmaInitData} = get()
                try {
                    const tokens = await authService.authenticate(tmaInitData)
                    set({authTokens: tokens, isAuthenticated: true})
                } catch (error) {
                    console.error('Failed to authenticate:', error)
                    get().addToast({
                        type: 'error',
                        message: 'Не удалось авторизоваться'
                    })
                    throw error
                }
            },

            updateCustomerInfo: async () => {
                const {tmaInitData} = get()
                
                try {
                    const initData = parseInitDataQuery(tmaInitData)
                    
                    if (!initData || !initData.user) {
                        console.warn('No user data available in initData')
                        return
                    }

                    const user = initData.user as User

                    const customerData: UpdateCustomerRequest = {
                        first_name: user.first_name,
                        last_name: user.last_name,
                        language_code: user.language_code,
                        tma_user: {
                            id: user.id,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            username: user.username,
                            language_code: user.language_code,
                            is_premium: user.is_premium,
                            is_bot: user.is_bot,
                            allows_write_to_pm: user.allows_write_to_pm,
                            added_to_attachment_menu: user.added_to_attachment_menu,
                            photo_url: user.photo_url,
                        }
                    }

                    await apiService.updateCustomer(customerData)
                } catch (error) {
                    console.error('Failed to update customer info:', error)
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
                    const errorMessage = error instanceof Error ? error.message : 'Не удалось создать новый чат'
                    get().addToast({
                        type: 'error',
                        message: errorMessage
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
                    const errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить чат'
                    get().addToast({
                        type: 'error',
                        message: errorMessage
                    })
                    set({isLoading: false})
                }
            },

            sendMessage: async (content: string) => {
                const {currentChatId, chats} = get()

                if (!content.trim()) return

                let targetChatId = currentChatId
                let updatedChats: Chat[]
                
                const messageId = uuidV7()

                try {
                    if (!targetChatId) {
                        const title = content.length > 30 ? content.substring(0, 30) + '...' : content
                        const newChat = await apiService.createChat(title)
                        targetChatId = newChat.id
                        
                        updatedChats = [newChat, ...chats]
                        set({
                            currentChatId: targetChatId,
                            chats: updatedChats
                        })
                    } else {
                        updatedChats = chats
                    }

                    const optimisticUserMessage: Message = {
                        id: messageId,
                        content: content,
                        author: 'customer',
                        sent_at: Math.floor(Date.now() / 1000)
                    }

                    const chatsWithOptimisticMessage = updatedChats.map(chat =>
                        chat.id === targetChatId
                            ? {
                                ...chat,
                                messages: [...(chat.messages || []), optimisticUserMessage],
                                message_count: (chat.message_count ?? 0) + 1
                            }
                            : chat
                    )

                    set({chats: chatsWithOptimisticMessage, isTyping: true})

                    const messages = await apiService.sendMessage(targetChatId, content, messageId)

                    const finalChats = chatsWithOptimisticMessage.map(chat =>
                        chat.id === targetChatId
                            ? {
                                ...chat,
                                messages: [
                                    ...(chat.messages || []).filter(m => m.id !== messageId),
                                    ...messages
                                ],
                                message_count: (chat.message_count ?? 0) - 1 + messages.length,
                                last_message: messages[messages.length - 1]?.content || content,
                                last_message_at: messages[messages.length - 1]?.sent_at || Math.floor(Date.now() / 1000)
                            }
                            : chat
                    )

                    set({chats: finalChats, isTyping: false})
                } catch (error) {
                    console.error('Failed to send message:', error)
                    
                    const chatsWithoutOptimisticMessage = get().chats.map(chat =>
                        chat.id === targetChatId
                            ? {
                                ...chat,
                                messages: (chat.messages || []).filter(m => m.id !== messageId),
                                message_count: Math.max((chat.message_count ?? 1) - 1, 0)
                            }
                            : chat
                    )
                    
                    set({chats: chatsWithoutOptimisticMessage, isTyping: false})

                    const errorMessage = error instanceof Error ? error.message : 'Не удалось отправить сообщение'
                    
                    get().addToast({
                        type: 'error',
                        message: errorMessage
                    })
                }
            },

            sendVoiceMessage: async (audioBlob: Blob) => {
                const {currentChatId, chats} = get()

                let targetChatId = currentChatId
                let updatedChats: Chat[]
                
                const messageId = uuidV7()

                try {
                    if (!targetChatId) {
                        const newChat = await apiService.createChat('Новый чат')
                        targetChatId = newChat.id
                        
                        updatedChats = [newChat, ...chats]
                        set({
                            currentChatId: targetChatId,
                            chats: updatedChats
                        })
                    } else {
                        updatedChats = chats
                    }

                    const optimisticUserMessage: Message = {
                        id: messageId,
                        content: '🎤 Голосовое сообщение',
                        author: 'customer',
                        sent_at: Math.floor(Date.now() / 1000)
                    }

                    const chatsWithOptimisticMessage = updatedChats.map(chat =>
                        chat.id === targetChatId
                            ? {
                                ...chat,
                                messages: [...(chat.messages || []), optimisticUserMessage],
                                message_count: (chat.message_count ?? 0) + 1
                            }
                            : chat
                    )

                    set({chats: chatsWithOptimisticMessage, isTyping: true})

                    const messages = await apiService.sendVoiceMessage(targetChatId, audioBlob, messageId)

                    const finalChats = chatsWithOptimisticMessage.map(chat =>
                        chat.id === targetChatId
                            ? {
                                ...chat,
                                messages: [
                                    ...(chat.messages || []).filter(m => m.id !== messageId),
                                    ...messages
                                ],
                                message_count: (chat.message_count ?? 0) - 1 + messages.length,
                                last_message: messages[messages.length - 1]?.content || '[Голосовое сообщение]',
                                last_message_at: messages[messages.length - 1]?.sent_at || Math.floor(Date.now() / 1000)
                            }
                            : chat
                    )

                    set({chats: finalChats, isTyping: false})
                } catch (error) {
                    console.error('Failed to send voice message:', error)
                    
                    set({isTyping: false})
                    
                    const chatsWithoutOptimisticMessage = get().chats.map(chat =>
                        chat.id === targetChatId
                            ? {
                                ...chat,
                                messages: (chat.messages || []).filter(m => m.id !== messageId),
                                message_count: Math.max((chat.message_count ?? 1) - 1, 0)
                            }
                            : chat
                    )
                    
                    set({chats: chatsWithoutOptimisticMessage})

                    const errorMessage = error instanceof Error ? error.message : 'Не удалось отправить голосовое сообщение'
                    
                    get().addToast({
                        type: 'error',
                        message: errorMessage
                    })
                    
                    throw error
                }
            },

            deleteChat: async (chatId: string) => {
                try {
                    await apiService.deleteChat(chatId)
                    
                    const {chats, currentChatId} = get()
                    const updatedChats = chats.filter(chat => chat.id !== chatId)
                    
                    set({
                        chats: updatedChats,
                        currentChatId: currentChatId === chatId ? null : currentChatId
                    })
                    
                    get().addToast({
                        type: 'success',
                        message: 'Чат успешно удален'
                    })
                } catch (error) {
                    console.error('Failed to delete chat:', error)
                    const errorMessage = error instanceof Error ? error.message : 'Не удалось удалить чат'
                    get().addToast({
                        type: 'error',
                        message: errorMessage
                    })
                }
            },

            toggleSidebar: () => set(state => ({sidebarOpen: !state.sidebarOpen})),
            setSidebarOpen: (open: boolean) => set({sidebarOpen: open}),
            setCurrentChat: (chatId: string | null) => set({currentChatId: chatId}),
            setLoading: (loading: boolean) => set({isLoading: loading}),
            setTyping: (typing: boolean) => set({isTyping: typing}),

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
            },

            setAuthTokens: (tokens: AuthTokens | null) => set({authTokens: tokens}),
            setIsAuthenticated: (authenticated: boolean) => set({isAuthenticated: authenticated})
        }),
        {
            name: 'telegram-chat-app'
        }
    )
)
