import {Loader2} from 'lucide-react'
import {cn} from '@/lib/utils'

interface LoaderProps {
    isVisible: boolean
}

export function Loader({ isVisible }: LoaderProps) {
    if (!isVisible) return null

    return (
        <div className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center",
            "bg-background/80 backdrop-blur-sm",
            "animate-in fade-in duration-200"
        )}>
            <div className="flex flex-col items-center gap-4">
                <Loader2 size={48} className="text-primary animate-spin" />
                <p className="text-lg font-medium text-muted-foreground">Загрузка...</p>
            </div>
        </div>
    )
}
