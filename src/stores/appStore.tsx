import {create} from 'zustand'
import {devtools} from 'zustand/middleware'
import {AppState, Chat, ToastMessage, AuthTokens} from '@/types'
import {apiService} from '@/services/apiService'
import {authService} from '@/services/authService'
import {generateId} from '@/utils/helpers'
import {retrieveRawInitData} from '@telegram-apps/bridge';

interface AppStore extends AppState {
    initializeApp: () => Promise<void>
    authenticate: () => Promise<void>

    createNewChat: () => Promise<void>
    loadChat: (chatId: string) => Promise<void>
    sendMessage: (content: string) => Promise<void>
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

                const debugTmaInitData = 'user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%20%2B%20-%20%3F%20%5C%2F%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%22%7D&chat_instance=8134722200314281151&chat_type=private&auth_date=1733584787&hash=2174df5b000556d044f3f020384e879c8efcab55ddea2ced4eb752e93e7080d6&signature=zL-ucjNyREiHDE8aihFwpfR9aggP2xiAo3NSpfe-p7IbCisNlDKlo7Kb6G4D0Ao2mBrSgEk4maLSdv6MLIlADQ';
                const tmaInitData = retrieveRawInitData() || debugTmaInitData

                set({tmaInitData: tmaInitData})

                try {
                    const isAuth = await authService.isAuthenticated()
                    if (!isAuth) {
                        await get().authenticate()
                    }

                    const chats = await apiService.getChats()
                    set({chats, isLoading: false})
                } catch (error) {
                    console.error('Failed to initialize app:', error)
                    get().addToast({
                        type: 'error',
                        message: 'Не удалось инициализировать приложение'
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

                let targetChatId = currentChatId
                let updatedChats: Chat[]

                set({isTyping: true})

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

                    const messages = await apiService.sendMessage(targetChatId, content)

                    const finalChats = updatedChats.map(chat =>
                        chat.id === targetChatId
                            ? {
                                ...chat,
                                messages: [...(chat.messages || []), ...messages],
                                last_message: messages[messages.length - 1]?.content || content,
                                last_message_at: messages[messages.length - 1]?.sent_at || Math.floor(Date.now() / 1000)
                            }
                            : chat
                    )

                    set({chats: finalChats, isTyping: false})
                } catch (error) {
                    console.error('Failed to send message:', error)
                    get().addToast({
                        type: 'error',
                        message: 'Не удалось отправить сообщение'
                    })
                    set({isTyping: false})
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
                    get().addToast({
                        type: 'error',
                        message: 'Не удалось удалить чат'
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
