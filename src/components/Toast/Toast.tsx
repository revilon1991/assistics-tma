import {AlertCircle, AlertTriangle, CheckCircle, Info, X} from 'lucide-react'
import {useAppStore} from '@/stores/appStore'
import {ToastMessage} from '@/types'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'

interface ToastProps {
    messages: ToastMessage[]
}

export function Toast({messages}: ToastProps) {
    const {removeToast} = useAppStore()

    const getIcon = (type: ToastMessage['type']) => {
        switch (type) {
            case 'success':
                return <CheckCircle size={20}/>
            case 'error':
                return <AlertCircle size={20}/>
            case 'warning':
                return <AlertTriangle size={20}/>
            case 'info':
            default:
                return <Info size={20}/>
        }
    }

    const getVariantClasses = (type: ToastMessage['type']) => {
        switch (type) {
            case 'success':
                return 'bg-green-500/90 text-white border-green-600'
            case 'error':
                return 'bg-destructive/90 text-destructive-foreground border-destructive'
            case 'warning':
                return 'bg-yellow-500/90 text-white border-yellow-600'
            case 'info':
            default:
                return 'bg-blue-500/90 text-white border-blue-600'
        }
    }

    if (messages.length === 0) {
        return null
    }

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-md">
            {messages.map((toast) => (
                <div
                    key={toast.id}
                    className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm",
                        "animate-in slide-in-from-right duration-300",
                        getVariantClasses(toast.type)
                    )}
                >
                    <div className="flex-shrink-0">
                        {getIcon(toast.type)}
                    </div>
                    <div className="flex-1 text-sm font-medium">
                        {toast.message}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0 text-current hover:bg-white/20"
                        onClick={() => removeToast(toast.id)}
                        aria-label="Закрыть уведомление"
                    >
                        <X size={16}/>
                    </Button>
                </div>
            ))}
        </div>
    )
}
