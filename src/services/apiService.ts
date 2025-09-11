import {Chat, Message, SendMessageResponse, ApiResponse} from '@/types'

class ApiService {
    private baseUrl = 'https://your-assistant-api.com' // Замените на ваш API URL

    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const initDataRaw = window.Telegram?.WebApp?.initData || ''

        const defaultOptions: RequestInit = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `tma ${initDataRaw}`,
                ...options.headers
            }
        }

        const finalOptions = {...defaultOptions, ...options}

        const response = await fetch(`${this.baseUrl}${endpoint}`, finalOptions)

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return response.json()
    }

    async getChats(): Promise<Chat[]> {
        try {
            const response = await this.makeRequest<ApiResponse<Chat[]>>('/api/chats')
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch chats:', error)
            throw error
        }
    }

    async createChat(title: string): Promise<Chat> {
        let response: ApiResponse<Chat>;

        try {
            response = await this.makeRequest<ApiResponse<Chat>>('/api/chats', {
                method: 'POST',
                body: JSON.stringify({title})
            })
        } catch (error) {
            console.error('Failed to create chat:', error)
            throw error
        }

        if (!response?.data) {
            throw new Error('No data in response')
        }

        return response.data
    }

    async getChatMessages(chatId: string): Promise<Message[]> {
        try {
            const response = await this.makeRequest<ApiResponse<Message[]>>(
                `/api/chats/${chatId}/messages`
            )
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch messages:', error)
            throw error
        }
    }

    async sendMessage(chatId: string, message: string): Promise<SendMessageResponse> {
        let response: ApiResponse<SendMessageResponse>;

        try {
            response = await this.makeRequest<ApiResponse<SendMessageResponse>>(
                `/api/chats/${chatId}/messages`,
                {
                    method: 'POST',
                    body: JSON.stringify({message})
                }
            )
        } catch (error) {
            console.error('Failed to send message:', error)
            throw error
        }

        if (!response.data) {
            throw new Error('No data in response')
        }

        return response.data
    }
}

export const apiService = new ApiService()
