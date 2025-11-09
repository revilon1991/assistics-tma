import {useEffect, useRef, useCallback, useState} from 'react'
import {Bot, Menu, User, Trash2} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {useAppStore} from '@/stores/appStore'
import {Input} from '@/components/Input/Input'
import {VoiceRecordingOverlay} from '@/components/VoiceRecordingOverlay/VoiceRecordingOverlay'
import {formatTime} from '@/utils/helpers'
import {Button} from '@/components/ui/button'
import {ScrollArea} from '@/components/ui/scroll-area'
import {ThemeToggle} from '@/components/ThemeToggle/ThemeToggle'
import {cn} from '@/lib/utils'
import {
    Card,
    CardContent,
} from "@/components/ui/card"

export function Chat() {
    const {
        chats,
        currentChatId,
        isTyping,
        toggleSidebar,
        sendMessage,
        sendVoiceMessage,
        deleteChat
    } = useAppStore()

    const [isRecording, setIsRecording] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const currentChat = chats.find(chat => chat.id === currentChatId)
    const isFirstChat = chats.length === 0

    useEffect(() => {
        scrollToBottom()
    }, [currentChat?.messages, isTyping])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
    }

    const handleSendMessage = useCallback(async (content: string) => {
        await sendMessage(content)
    }, [sendMessage])

    const handleSendVoiceMessage = useCallback(async (audioBlob: Blob) => {
        setIsRecording(false)
        await sendVoiceMessage(audioBlob)
    }, [sendVoiceMessage])

    const handleRecordingStateChange = useCallback((recording: boolean) => {
        setIsRecording(recording)
    }, [])

    const handleCancelRecording = useCallback(() => {
        setIsRecording(false)
    }, [])

    const handleDeleteChat = async () => {
        if (!currentChatId) return

        if (confirm('Вы уверены, что хотите удалить этот чат?')) {
            await deleteChat(currentChatId)
        }
    }

    return (
        <div className="flex flex-col flex-1 h-screen min-h-0">
            <VoiceRecordingOverlay
                isRecording={isRecording}
                onCancel={handleCancelRecording}
            />
            <header className="h-[60px] bg-secondary border-b flex items-center px-4 flex-shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="mr-3 text-foreground hover:bg-accent"
                    aria-label="Открыть меню"
                >
                    <Menu size={20}/>
                </Button>
                <h1 className="flex-1 text-lg font-semibold overflow-hidden whitespace-nowrap text-ellipsis">
                    {currentChat ? currentChat.title : 'Assistics Chat'}
                </h1>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    {currentChatId && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDeleteChat}
                            className="text-foreground hover:text-destructive hover:bg-destructive/10"
                            aria-label="Удалить чат"
                        >
                            <Trash2 size={20}/>
                        </Button>
                    )}
                </div>
            </header>

            {/* Messages */}
            <ScrollArea className="flex-1 min-h-0">
                {!currentChat ? (
                    <div className="h-full flex items-center justify-center p-10">
                        <div className="text-center max-w-md">
                            <img 
                                src="/images/bot-assistics-small.png"
                                alt="Bot" 
                                className="h-48 mx-auto mb-4"
                            />
                            <Card className="shadow-none mt-10">
                                    {isFirstChat ? (
                                        <CardContent className="text-left">
                                            <p>
                                                Привет! 👋<br/>
                                                Я твой AI-помощник и уже готов подключиться к делу.
                                            </p>

                                            <b>Могу:</b> <br/>
                                            ❓ Отвечать на вопросы <br/>
                                            🔍 Подсказывать нужную информацию <br/>
                                            ✅ Помогать с задачами и инструкциями <br/>
                                            💡 Генерировать текcт/стихи/код <br/>
                                            ⚡ Работать 24/7 без выходных

                                            <p>Спрашивай, что угодно - разберёмся вместе!</p>
                                        </CardContent>
                                        ) : (
                                        <CardContent className="text-left">
                                            Начните новый разговор, отправив сообщение
                                        </CardContent>
                                    )}

                            </Card>
                        </div>
                    </div>
                ) : (currentChat.messages || []).length === 0 ? (
                    <div className="h-full flex items-center justify-center p-10">
                        <div className="text-center max-w-md">
                            <img 
                                src="/images/bot-assistics-small.png"
                                alt="Bot" 
                                className="h-24 mx-auto mb-4"
                            />
                            <h2 className="text-2xl font-semibold mb-3">Новый чат начат!</h2>
                            <p className="text-muted-foreground">Отправьте первое сообщение, чтобы начать разговор.</p>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto p-5 w-full">
                        {(currentChat.messages || []).map((message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    "flex gap-3 mb-6 animate-in fade-in duration-300",
                                    message.author === 'customer' && "flex-row-reverse"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                    message.author === 'customer' ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                                )}>
                                    {message.author === 'customer' ? (
                                        <User size={16}/>
                                    ) : (
                                        <Bot size={16}/>
                                    )}
                                </div>
                                <div className={cn(
                                    "flex-1 max-w-[70%] min-w-0",
                                    message.author === 'customer' && "text-right"
                                )}>
                                    <div className={cn(
                                        "rounded-xl p-3 px-4 break-words",
                                        "select-text prose prose-sm prose lg:prose-x dark:prose-invert max-w-none",
                                        message.author === 'customer' 
                                            ? "bg-primary text-primary-foreground" 
                                            : "bg-secondary text-secondary-foreground"
                                    )}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {message.content}
                                        </ReactMarkdown>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1 px-1">
                                        {formatTime(message.sent_at)}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex gap-3 mb-6">
                                <div className="w-8 h-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center flex-shrink-0">
                                    <Bot size={16}/>
                                </div>
                                <div className="flex-1 max-w-[70%]">
                                    <div className="bg-secondary rounded-xl p-3 px-4 flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground italic">Печатает</span>
                                        <div className="flex gap-0.5">
                                            <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef}/>
                    </div>
                )}
            </ScrollArea>

            <Input 
                onSendMessage={handleSendMessage} 
                onSendVoiceMessage={handleSendVoiceMessage}
                onRecordingStateChange={handleRecordingStateChange}
                disabled={isTyping}
                isTyping={isTyping}
            />
        </div>
    )
}
