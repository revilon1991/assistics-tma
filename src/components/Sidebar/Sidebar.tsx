import {MessageCircle, Plus, X} from 'lucide-react'
import {useAppStore} from '@/stores/appStore'
import {formatDate, truncateText} from '@/utils/helpers'
import {Button} from '@/components/ui/button'
import {ScrollArea} from '@/components/ui/scroll-area'
import {Card} from '@/components/ui/card'
import {Separator} from '@/components/ui/separator'
import {cn} from '@/lib/utils'

export function Sidebar() {
    const {
        chats,
        currentChatId,
        sidebarOpen,
        setSidebarOpen,
        createNewChat,
        setCurrentChat,
        loadChat
    } = useAppStore()

    const handleChatClick = async (chatId: string) => {
        if (chatId === currentChatId) {
            setSidebarOpen(false)
            return
        }

        setCurrentChat(chatId)
        await loadChat(chatId)
    }

    const handleNewChat = async () => {
        await createNewChat()
    }

    const handleOverlayClick = () => {
        setSidebarOpen(false)
    }

    return (
        <>
            {/* Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in duration-200"
                    onClick={handleOverlayClick}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed top-0 left-0 h-screen w-[var(--sidebar-width)] bg-background border-r z-50",
                "flex flex-col transition-transform duration-300 ease-in-out",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Header */}
                <header className="h-[60px] px-4 flex items-center justify-between border-b bg-secondary/50">
                    <h2 className="text-lg font-semibold">История чатов</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(false)}
                        className="text-foreground hover:bg-accent"
                        aria-label="Закрыть меню"
                    >
                        <X size={20}/>
                    </Button>
                </header>

                {/* Content */}
                <div className="flex-1 flex flex-col min-h-0 p-3">
                    <Button
                        onClick={handleNewChat}
                        className="w-full mb-3 gap-2 bg-primary !text-white hover:bg-primary/90"
                        size="lg"
                    >
                        <Plus size={16}/>
                        Новый чат
                    </Button>

                    <Separator className="mb-3" />

                    <ScrollArea className="flex-1">
                        <div className="space-y-2 pr-3">
                            {chats.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <MessageCircle size={48} className="text-muted-foreground mb-3"/>
                                    <p className="font-medium mb-1">Пока нет чатов</p>
                                    <span className="text-sm text-muted-foreground">
                                        Создайте первый чат, чтобы начать общение
                                    </span>
                                </div>
                            ) : (
                                chats.map((chat) => (
                                    <Card
                                        key={chat.id}
                                        className={cn(
                                            "p-3 cursor-pointer transition-colors hover:bg-accent",
                                            chat.id === currentChatId && "bg-accent border-primary"
                                        )}
                                        onClick={() => handleChatClick(chat.id)}
                                    >
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="font-medium text-sm overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                                                    {truncateText(chat.title, 30)}
                                                </div>
                                                <div className="text-xs text-muted-foreground flex-shrink-0">
                                                    {formatDate(chat.last_message_at)}
                                                </div>
                                            </div>
                                            {chat.lastMessage && (
                                                <div className="text-xs text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                                                    {truncateText(chat.lastMessage, 50)}
                                                </div>
                                            )}
                                            {(chat.message_count !== undefined && chat.message_count > 0) && (
                                                <div className="flex justify-end">
                                                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
                                                        {chat.message_count}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </aside>
        </>
    )
}
