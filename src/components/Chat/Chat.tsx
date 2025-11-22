import {useEffect, useRef, useCallback, useState} from 'react'
import {Bot, Menu, User, Trash2} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import {useAppStore} from '@/stores/appStore'
import {Input} from '@/components/Input/Input'
import {VoiceRecordingOverlay} from '@/components/VoiceRecordingOverlay/VoiceRecordingOverlay'
import {formatTime} from '@/utils/helpers'
import {Button} from '@/components/ui/button'
import {ScrollArea} from '@/components/ui/scroll-area'
import {ThemeToggle} from '@/components/ThemeToggle/ThemeToggle'
import {CodeBlock} from '@/components/CodeBlock/CodeBlock'
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
    const lastBotMessageRef = useRef<HTMLDivElement>(null)

    const currentChat = chats.find(chat => chat.id === currentChatId)
    const isFirstChat = chats.length === 0

    // const messages = [{
    //     "id": "019a0ddc-25e3-7591-a9c2-1b24bea1f0da",
    //     "content": "hi",
    //     "author": "customer",
    //     "sent_at": 1761169123
    // }, {
    //     "id": "019a0ddc-43bf-77f4-b6cf-2178690d89f4",
    //     "content": "Hello! How can I assist you today?",
    //     "author": "assistics",
    //     "sent_at": 1761169130
    // }, {
    //     "id": "019a6929-b6a9-76ad-a62c-e042fc9c86b4",
    //     "content": "\u041d\u0430\u043f\u0438\u0448\u0438 \u043c\u043d\u0435 \u0441\u043a\u0440\u0438\u043f\u0442 \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u0430\u0446\u0438\u0438 \u043d\u0430 php",
    //     "author": "customer",
    //     "sent_at": 1762700933
    // }, {
    //     "id": "019a6929-dff0-77af-a7db-329697fc7c02",
    //     "content": "\u041a\u043e\u043d\u0435\u0447\u043d\u043e! \u0412\u043e\u0442 \u043f\u0440\u043e\u0441\u0442\u043e\u0439 \u0441\u043a\u0440\u0438\u043f\u0442 \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u0430\u0446\u0438\u0438 \u043d\u0430 PHP:\n\n```php\n\u003C?php\n\/\/ \u0421\u0442\u0430\u0440\u0442\u0443\u0435\u043c \u0441\u0435\u0441\u0441\u0438\u044e\nsession_start();\n\n\/\/ \u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435 \u043a \u0431\u0430\u0437\u0435 \u0434\u0430\u043d\u043d\u044b\u0445 (\u0437\u0430\u043c\u0435\u043d\u0438\u0442\u0435 \u043d\u0430 \u0432\u0430\u0448\u0438 \u0434\u0430\u043d\u043d\u044b\u0435)\n$servername = \u0022localhost\u0022;\n$username = \u0022username\u0022;\n$password = \u0022password\u0022;\n$dbname = \u0022database_name\u0022;\n\n$conn = new mysqli($servername, $username, $password, $dbname);\n\n\/\/ \u041f\u0440\u043e\u0432\u0435\u0440\u043a\u0430 \u0441\u043e\u0435\u0434\u0438\u043d\u0435\u043d\u0438\u044f\nif ($conn-\u003Econnect_error) {\n    die(\u0022Connection failed: \u0022 . $conn-\u003Econnect_error);\n}\n\n\/\/ \u041e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0430 \u0434\u0430\u043d\u043d\u044b\u0445 \u0438\u0437 \u0444\u043e\u0440\u043c\u044b\nif ($_SERVER[\u0022REQUEST_METHOD\u0022] == \u0022POST\u0022) {\n    $user = $_POST[\u0027username\u0027];\n    $pass = $_POST[\u0027password\u0027];\n\n    \/\/ \u041f\u0440\u043e\u0441\u0442\u043e\u0439 SQL \u0437\u0430\u043f\u0440\u043e\u0441 \u0434\u043b\u044f \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0438 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f\n    $sql = \u0022SELECT * FROM users WHERE username=\u0027$user\u0027 AND password=\u0027$pass\u0027\u0022;\n    $result = $conn-\u003Equery($sql);\n\n    \/\/ \u041f\u0440\u043e\u0432\u0435\u0440\u043a\u0430 \u0440\u0435\u0437\u0443\u043b\u044c\u0430\u0442\u043e\u0432 \u0437\u0430\u043f\u0440\u043e\u0441\u0430\n    if ($result-\u003Enum_rows \u003E 0) {\n        $_SESSION[\u0027username\u0027] = $user;\n        echo \u0022Login successful. Welcome, \u0022 . $user . \u0022!\u0022;\n    } else {\n        echo \u0022Invalid username or password.\u0022;\n    }\n}\n\n$conn-\u003Eclose();\n?\u003E\n\n\u003Chtml\u003E\n\u003Cbody\u003E\n    \u003Cform method=\u0022post\u0022 action=\u0022\u003C?php echo htmlspecialchars($_SERVER[\u0022PHP_SELF\u0022]);?\u003E\u0022\u003E\n        Username: \u003Cinput type=\u0022text\u0022 name=\u0022username\u0022\u003E\u003Cbr\u003E\n        Password: \u003Cinput type=\u0022password\u0022 name=\u0022password\u0022\u003E\u003Cbr\u003E\n        \u003Cinput type=\u0022submit\u0022 value=\u0022Login\u0022\u003E\n    \u003C\/form\u003E\n\u003C\/body\u003E\n\u003C\/html\u003E\n```\n\n### \u041f\u043e\u044f\u0441\u043d\u0435\u043d\u0438\u044f:\n1. **\u0421\u0435\u0441\u0441\u0438\u0438:** \u0418\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u044e\u0442\u0441\u044f \u0434\u043b\u044f \u0445\u0440\u0430\u043d\u0435\u043d\u0438\u044f \u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u0438 \u043e \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0435 \u043f\u043e\u0441\u043b\u0435 \u0430\u0432\u0442\u043e\u0440\u0438\u0437\u0430\u0446\u0438\u0438.\n2. **\u0424\u043e\u0440\u043c\u0430:** HTML-\u0444\u043e\u0440\u043c\u0430 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u044f\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0435 \u0441 \u043f\u043e\u043c\u043e\u0449\u044c\u044e \u043c\u0435\u0442\u043e\u0434\u0430 POST.\n3. **SQL-\u0437\u0430\u043f\u0440\u043e\u0441:** \u041f\u0440\u043e\u0432\u0435\u0440\u044f\u0435\u0442 \u043d\u0430\u043b\u0438\u0447\u0438\u0435 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f \u0441 \u0443\u043a\u0430\u0437\u0430\u043d\u043d\u044b\u043c\u0438 \u043b\u043e\u0433\u0438\u043d\u043e\u043c \u0438 \u043f\u0430\u0440\u043e\u043b\u0435\u043c \u0432 \u0431\u0430\u0437\u0435 \u0434\u0430\u043d\u043d\u044b\u0445.\n4. **\u041f\u043e\u0434\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435 \u043a \u0431\u0430\u0437\u0435 \u0434\u0430\u043d\u043d\u044b\u0445:** \u0412\u0441\u0442\u0430\u0432\u044c\u0442\u0435 \u0441\u0432\u043e\u0438 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u044f \u0434\u043b\u044f \u0434\u043e\u0441\u0442\u0443\u043f\u0430 \u043a \u0431\u0430\u0437\u0435 \u0434\u0430\u043d\u043d\u044b\u0445.\n\n### \u0417\u0430\u043c\u0435\u0447\u0430\u043d\u0438\u0435:\n- **\u0411\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u044c:** \u042d\u0442\u043e\u0442 \u0441\u043a\u0440\u0438\u043f\u0442 \u043f\u0440\u0435\u0434\u043d\u0430\u0437\u043d\u0430\u0447\u0435\u043d \u0442\u043e\u043b\u044c\u043a\u043e \u0434\u043b\u044f \u0434\u0435\u043c\u043e\u043d\u0441\u0442\u0440\u0430\u0446\u0438\u0438. \u0412 \u0440\u0435\u0430\u043b\u044c\u043d\u043e\u043c \u043f\u0440\u0438\u043b\u043e\u0436\u0435\u043d\u0438\u0438 \u0441\u043b\u0435\u0434\u0443\u0435\u0442 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u044c \u043f\u043e\u0434\u0433\u043e\u0442\u043e\u0432\u043b\u0435\u043d\u043d\u044b\u0435 \u0437\u0430\u043f\u0440\u043e\u0441\u044b (prepared statements) \u0434\u043b\u044f \u043f\u0440\u0435\u0434\u043e\u0442\u0432\u0440\u0430\u0449\u0435\u043d\u0438\u044f SQL-\u0438\u043d\u044a\u0435\u043a\u0446\u0438\u0439.\n- **\u0425\u0435\u0448\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u043f\u0430\u0440\u043e\u043b\u0435\u0439:** \u041d\u0435 \u0437\u0430\u0431\u044b\u0432\u0430\u0439\u0442\u0435 \u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0445\u0435\u0448\u0438 \u043f\u0430\u0440\u043e\u043b\u0435\u0439 (\u043d\u0430\u043f\u0440\u0438\u043c\u0435\u0440, \u0441 \u043f\u043e\u043c\u043e\u0449\u044c\u044e `password_hash()`), \u0430 \u043d\u0435 \u0441\u0430\u043c \u0442\u0435\u043a\u0441\u0442.",
    //     "author": "assistics",
    //     "sent_at": 1762700943
    // }];
    //
    // const currentChat = {
    //     id: '1',
    //     title: '5',
    //     started_at: 1,
    //     last_message: '7676867',
    //     last_message_at: 767667,
    //     message_count: 7,
    //     messages: messages,
    //     lastMessage: 'string',
    // };

    useEffect(() => {
        const messages = currentChat?.messages || []
        const lastMessage = messages[messages.length - 1]

        if (lastMessage?.author === 'assistics' && lastBotMessageRef.current) {
            lastBotMessageRef.current.scrollIntoView({behavior: 'smooth', block: 'start'})
        } else {
            messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
        }
    }, [currentChat?.messages, isTyping])

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
                    <div className=" p-5 max-w-3xl w-dvw mx-auto">
                        {(currentChat.messages || []).map((message, index, messages) => {
                            const isLastBotMessage = message.author === 'assistics' &&
                                (index === messages.length - 1 ||
                                    messages.slice(index + 1).every(m => m.author === 'customer'))

                            return (
                            <div
                                key={message.id}
                                ref={isLastBotMessage ? lastBotMessageRef : null}
                                className={cn(
                                    "flex gap-3 mb-6 animate-in fade-in duration-300",
                                    message.author === 'customer' && "flex-row-reverse"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                    message.author === 'customer' ? "bg-primary text-white" : "bg-secondary text-muted-foreground"
                                )}>
                                    {message.author === 'customer' ? (
                                        <User size={16}/>
                                    ) : (
                                        <Bot size={16}/>
                                    )}
                                </div>
                                <div className={cn(
                                    "flex flex-col max-w-[70%] min-w-0",
                                    message.author === 'customer' && "items-end"
                                )}>
                                    <div className={cn(
                                        "rounded-xl px-4 w-fit max-w-full",
                                        "select-text prose prose-sm dark:prose-invert",
                                        message.author === 'customer'
                                            ? "bg-primary text-white"
                                            : "bg-secondary text-secondary-foreground"
                                    )}>
                                        <div className="min-w-0 max-w-full break-words">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            rehypePlugins={[rehypeHighlight]}
                                            components={{
                                                code: ({className, children, ...props}: any) => {
                                                    const match = /language-(\w+)/.exec(className || '')
                                                    const inline = !match
                                                    return (
                                                        <CodeBlock
                                                            inline={inline}
                                                            className={className}
                                                            {...props}
                                                        >
                                                            {children}
                                                        </CodeBlock>
                                                    )
                                                }
                                            }}
                                        >
                                            {message.content}
                                        </ReactMarkdown>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "text-xs text-muted-foreground mt-1 px-1",
                                        message.author === 'customer' && "text-right"
                                    )}>
                                        {formatTime(message.sent_at)}
                                    </div>
                                </div>
                            </div>
                        )})}

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
