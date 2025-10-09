import {AlertCircle, AlertTriangle, CheckCircle, Info, X} from 'lucide-react'
import {useAppStore} from '@/stores/appStore'
import {ToastMessage} from '@/types'
import '@/components/Toast/Toast.css'

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

    if (messages.length === 0) {
        return null
    }

    return (
        <div className="toast-container">
            {messages.map((toast) => (
                <div
                    key={toast.id}
                    className={`toast toast-${toast.type}`}
                >
                    <div className="toast-icon">
                        {getIcon(toast.type)}
                    </div>
                    <div className="toast-content">
                        {toast.message}
                    </div>
                    <button
                        className="toast-close"
                        onClick={() => removeToast(toast.id)}
                        aria-label="Закрыть уведомление"
                    >
                        <X size={16}/>
                    </button>
                </div>
            ))}
        </div>
    )
}
