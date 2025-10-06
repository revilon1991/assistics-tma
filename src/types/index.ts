export interface Message {
    id: string;
    author: 'customer' | 'assistant';
    content: string;
    sent_at: Date;
}

export interface Chat {
    id: string;
    title: string;
    messages: Message[];
    lastMessage?: string;
    last_message_at: Date;
    started_at: Date;
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
