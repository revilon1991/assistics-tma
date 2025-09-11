export interface Message {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface Chat {
    id: string;
    title: string;
    messages: Message[];
    lastMessage?: string;
    updatedAt: Date;
    createdAt: Date;
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
