import {Chat, Message, UpdateCustomerRequest, Customer} from '@/types/index.ts'
import {uuidV7} from '@/utils/helpers'
import {authService} from '@/services/authService'

class ApiService {
    private baseUrl = import.meta.env.VITE_API_BASE_URL
    private readonly MAX_RETRIES = 3

    private async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {},
        retryCount: number = 0
    ): Promise<T> {
        try {
            let accessToken = await authService.getAccessToken()

            if (!accessToken) {
                console.log('Токен отсутствует, пробуем получить новый')
                try {
                    await authService.refreshTokens()
                    accessToken = await authService.getAccessToken()
                } catch (error) {
                    console.error('Не удалось получить токен:', error)
                    throw new Error('Не удалось авторизоваться')
                }
                
                if (!accessToken) {
                    throw new Error('Не удалось получить токен авторизации')
                }
            }

            const isFormData = options.body instanceof FormData
            
            const defaultHeaders: Record<string, string> = {
                'Authorization': `Bearer ${accessToken}`,
            }
            
            if (!isFormData) {
                defaultHeaders['Accept'] = 'application/json'
            }

            const defaultOptions: RequestInit = {
                method: 'GET',
                headers: {
                    ...defaultHeaders,
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

            if (endpoint.includes('/audio')) {
                console.log(`API Request: ${finalOptions.method} ${this.baseUrl}${endpoint}`)
            }

            const response = await fetch(`${this.baseUrl}${endpoint}`, finalOptions)
            
            if (endpoint.includes('/audio')) {
                console.log(`API Response: ${response.status} ${response.statusText}`)
            }

            if (response.status === 401) {
                console.warn('Получен 401, токен устарел')
                
                if (retryCount < this.MAX_RETRIES - 1) {
                    console.log('Обновляем токен и повторяем запрос...')
                    try {
                        await authService.refreshTokens()

                        return await this.makeRequest<T>(endpoint, options, retryCount + 1)
                    } catch (error) {
                        console.error('Не удалось обновить токен:', error)
                        if (retryCount < this.MAX_RETRIES - 1) {
                            return await this.makeRequest<T>(endpoint, options, retryCount + 1)
                        }
                    }
                }
                
                throw new Error('Не удалось авторизоваться после нескольких попыток. Пожалуйста, перезапустите приложение')
            }

            if (!response.ok) {
                console.error(`API Error: ${finalOptions.method} ${this.baseUrl}${endpoint}`, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries())
                })
                throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`)
            }

            if (response.status === 204) {
                console.log('Response status 204 (No Content)')
                return {} as T
            }

            const contentType = response.headers.get('content-type')
            
            if (endpoint.includes('/audio')) {
                console.log('Response details:', {
                    status: response.status,
                    contentType
                })
            }

            try {
                const text = await response.text()
                
                if (endpoint.includes('/audio')) {
                    console.log('Response text (first 200 chars):', text.substring(0, 200))
                }
                
                if (!text || text.trim() === '') {
                    console.warn('Empty response body, returning empty object')
                    return {} as T
                }
                
                try {
                    return JSON.parse(text)
                } catch (parseError) {
                    console.error('Failed to parse JSON:', parseError)
                    console.error('Response text:', text)
                    throw new Error(`Сервер вернул некорректный ответ: ${text.substring(0, 100)}`)
                }
            } catch (error) {
                console.error('Error reading response:', error)
                throw error
            }
        } catch (error) {
            if (retryCount < this.MAX_RETRIES - 1 && error instanceof Error && !error.message.includes('перезапустите')) {
                console.log(`Ошибка запроса, пробуем еще раз (попытка ${retryCount + 2}/${this.MAX_RETRIES})`)
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)))
                return await this.makeRequest<T>(endpoint, options, retryCount + 1)
            }
            throw error
        }
    }

    async getChats(): Promise<Chat[]> {
        try {
            const chats = await this.makeRequest<Chat[]>('/api/chats?order=desc&sort_by[]=lastMessageAt')
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

    async sendVoiceMessage(chatId: string, audioBlob: Blob, messageId: string): Promise<Message[]> {
        try {
            console.log('Отправка голосового сообщения:', {
                chatId,
                messageId,
                blobSize: audioBlob.size,
                blobType: audioBlob.type
            })

            const formData = new FormData()
            formData.append('audio', audioBlob, 'voice-message.webm')

            const response = await this.makeRequest<Message[] | Record<string, never>>(
                `/api/chats/${chatId}/messages/${messageId}/audio`,
                {
                    method: 'POST',
                    body: formData
                }
            )

            console.log('Voice message response:', response)

            if (!response || !Array.isArray(response) || response.length === 0) {
                console.log('Пустой ответ от сервера, возвращаем mock-данные')
                return [{
                    id: messageId,
                    content: '🎤 Голосовое сообщение',
                    author: 'customer',
                    sent_at: Math.floor(Date.now() / 1000)
                }]
            }

            return response
        } catch (error) {
            console.error('Failed to send voice message:', error)
            console.log('Роут не существует, возвращаем mock-данные для тестирования UI')
            
            return [{
                id: messageId,
                content: '🎤 Голосовое сообщение',
                author: 'customer',
                sent_at: Math.floor(Date.now() / 1000)
            }]
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

    async getCustomer(): Promise<Customer> {
        try {
            return await this.makeRequest<Customer>('/api/customers/me')
        } catch (error) {
            console.error('Failed to fetch customer:', error)
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