import {Chat, Message} from '@/types/index'
import {uuidV7} from '@/utils/helpers'
import {retrieveRawInitData} from '@tma.js/bridge';

class ApiService {
    private baseUrl = 'https://ui.assistics.net' // Ваш API URL

    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        // let tmaAuth
        const debugInitDataRaw = 'user=%7B%22id%22%3A279058397%2C%22first_name%22%3A%22Vladislav%20%2B%20-%20%3F%20%5C%2F%22%2C%22last_name%22%3A%22Kibenko%22%2C%22username%22%3A%22vdkfrost%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2F4FPEE4tmP3ATHa57u6MqTDih13LTOiMoKoLDRG4PnSA.svg%22%7D&chat_instance=8134722200314281151&chat_type=private&auth_date=1733584787&hash=2174df5b000556d044f3f020384e879c8efcab55ddea2ced4eb752e93e7080d6&signature=zL-ucjNyREiHDE8aihFwpfR9aggP2xiAo3NSpfe-p7IbCisNlDKlo7Kb6G4D0Ao2mBrSgEk4maLSdv6MLIlADQ'
        const initDataRaw = retrieveRawInitData() || debugInitDataRaw;

        const defaultOptions: RequestInit = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                // 'Authorization': `tma ${tmaAuth}`,
                'Authorization': `tma ${initDataRaw}`,
                ...options.headers
            }
        }

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        }

        console.log(`API Request: ${finalOptions.method} ${this.baseUrl}${endpoint}`)
        console.log('Headers:', finalOptions.headers)

        const response = await fetch(`${this.baseUrl}${endpoint}`, finalOptions)

        if (!response.ok) {
            console.error(`API Error: ${finalOptions.method} ${this.baseUrl}${endpoint}`, {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            })
            throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`)
        }

        return response.json()
    }

    async getChats(): Promise<Chat[]> {
        try {
            const chats = await this.makeRequest<Chat[]>('/api/chats')
            return chats || []
        } catch (error) {
            console.error('Failed to fetch chats:', error)
            throw error
        }
    }

    async createChat(title: string): Promise<Chat> {
        const chatId = uuidV7()

        try {
            const chat = await this.makeRequest<Chat>(`/api/chats/${chatId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({title})
            })

            return chat
        } catch (error) {
            console.error('Failed to create chat:', error)
            throw error
        }
    }

    async getChat(chatId: string): Promise<Chat> {
        try {
            const chat = await this.makeRequest<Chat>(`/api/chats/${chatId}`)
            return chat
        } catch (error) {
            console.error('Failed to fetch chat:', error)
            throw error
        }
    }

    async getChatMessages(chatId: string): Promise<Message[]> {
        try {
            const messages = await this.makeRequest<Message[]>(`/api/chats/${chatId}/messages`)
            return messages || []
        } catch (error) {
            console.error('Failed to fetch messages:', error)
            throw error
        }
    }

    async sendMessage(chatId: string, content: string): Promise<Message> {
        const messageId = uuidV7()

        try {
            const message = await this.makeRequest<Message>(
                `/api/chats/${chatId}/messages/${messageId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({content})
                }
            )

            return message
        } catch (error) {
            console.error('Failed to send message:', error)
            throw error
        }
    }
}

export const apiService = new ApiService()