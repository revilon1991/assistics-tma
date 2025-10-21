import {Chat, Message, UpdateCustomerRequest} from '@/types/index.ts'
import {uuidV7} from '@/utils/helpers'
import {authService} from '@/services/authService'

class ApiService {
    private baseUrl = import.meta.env.VITE_API_BASE_URL

    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const accessToken = await authService.getAccessToken()
        
        if (!accessToken) {
            throw new Error('Нет токена авторизации')
        }

        const defaultOptions: RequestInit = {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
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

        if (response.status === 204) {
            return {} as T
        }

        try {
            return await response.json()
        } catch (error) {
            console.warn('Failed to parse JSON response, returning empty object')
            return {} as T
        }
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
            const response = await this.makeRequest<Chat>(`/api/chats/${chatId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({title})
            })

            if (!response || Object.keys(response).length === 0) {
                return {
                    id: chatId,
                    title: title,
                    started_at: Math.floor(Date.now() / 1000),
                    last_message: '',
                    last_message_at: Math.floor(Date.now() / 1000)
                }
            }
            
            return response
        } catch (error) {
            console.error('Failed to create chat:', error)
            throw error
        }
    }

    async getChat(chatId: string): Promise<Chat> {
        try {
            return await this.makeRequest<Chat>(`/api/chats/${chatId}`)
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

    async sendMessage(chatId: string, content: string, messageId: string): Promise<Message[]> {
        try {
            const response = await this.makeRequest<Message[]>(
                `/api/chats/${chatId}/messages/${messageId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({content})
                }
            )

            if (!response || !Array.isArray(response) || response.length === 0) {
                return [{
                    id: messageId,
                    content: content,
                    author: 'customer',
                    sent_at: Math.floor(Date.now() / 1000)
                }]
            }

            return response
        } catch (error) {
            console.error('Failed to send message:', error)
            throw error
        }
    }

    async deleteChat(chatId: string): Promise<void> {
        try {
            await this.makeRequest<void>(`/api/chats/${chatId}`, {
                method: 'DELETE'
            })
        } catch (error) {
            console.error('Failed to delete chat:', error)
            throw error
        }
    }

    async updateCustomer(customerData: UpdateCustomerRequest): Promise<void> {
        try {
            await this.makeRequest<void>('/api/customers/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(customerData)
            })
            console.log('Customer data updated successfully')
        } catch (error) {
            console.error('Failed to update customer:', error)
        }
    }
}

export const apiService = new ApiService()