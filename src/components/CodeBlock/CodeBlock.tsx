import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
    children?: React.ReactNode
    className?: string
    inline?: boolean
}

export function CodeBlock({ children, className, inline }: CodeBlockProps) {
    const [copied, setCopied] = useState(false)
    
    // Извлекаем язык из className (format: language-xxx)
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : ''
    
    // Получаем текст кода
    const codeText = String(children).replace(/\n$/, '')
    
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(codeText)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }
    
    // Для inline кода (например, `code`)
    if (inline) {
        return (
            <code className={cn(
                "px-1.5 py-0.5 rounded text-sm font-mono",
                "bg-muted/50 text-foreground border border-border",
                className
            )}>
                {children}
            </code>
        )
    }
    
    // Для блоков кода
    return (
        <div className="relative group my-4 rounded-lg overflow-hidden border border-border">
            <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {language || 'plaintext'}
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-7 w-7 transition-all duration-200",
                        copied 
                            ? "opacity-100" 
                            : "opacity-0 group-hover:opacity-100"
                    )}
                    onClick={handleCopy}
                    aria-label={copied ? 'Скопировано' : 'Копировать код'}
                >
                    {copied ? (
                        <Check size={14} className="text-green-500" />
                    ) : (
                        <Copy size={14} />
                    )}
                </Button>
            </div>
            <div className="relative overflow-x-auto">
                <pre className={cn(
                    "!mt-0 !mb-0 !rounded-none p-4 overflow-x-auto",
                    className
                )}>
                    <code className={className}>
                        {children}
                    </code>
                </pre>
            </div>
        </div>
    )
}
