export interface Message {
    id: string;
    content: string;
    author: 'customer' | 'assistant';
    sent_at: number;
}

export interface Chat {
    id: string;
    title: string;
    started_at: number;
    last_message: string;
    last_message_at: number;
    messages?: Message[];
    lastMessage?: string;
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

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    issued_at: number;
    kid: string;
    audience: string;
    scope: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    issuedAt: number;
}

export interface AppState {
    tmaInitData: string;
    chats: Chat[];
    currentChatId: string | null;
    isLoading: boolean;
    isTyping: boolean;
    sidebarOpen: boolean;
    toasts: ToastMessage[];
    authTokens: AuthTokens | null;
    isAuthenticated: boolean;
}
