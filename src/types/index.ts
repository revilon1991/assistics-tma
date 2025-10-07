export interface Message {
    id: string;
    content: string;
    author: 'customer' | 'assistant';
    sent_at: number; // Unix timestamp
}

export interface Chat {
    id: string;
    title: string;
    started_at: number; // Unix timestamp
    last_message_at: number; // Unix timestamp
    messages?: Message[]; // Добавляем опционально для локального состояния
    lastMessage?: string; // Для локального состояния
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface SendMessageRequest {
    message: string;
    chatId?: string;
}

export interface SendMessageResponse {
    response: string;
    chatId: string;
    messageId: string;
}

export interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
}

export interface AppState {
    chats: Chat[];
    currentChatId: string | null;
    isLoading: boolean;
    sidebarOpen: boolean;
    toasts: ToastMessage[];
}
