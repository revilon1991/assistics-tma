import {Mic, X} from 'lucide-react'
import {cn} from '@/lib/utils'
import {Button} from '@/components/ui/button'

interface VoiceRecordingOverlayProps {
    isRecording: boolean
    onCancel?: () => void
}

export function VoiceRecordingOverlay({isRecording, onCancel}: VoiceRecordingOverlayProps) {
    if (!isRecording) return null

    return (
        <div className={cn(
            "fixed inset-0 z-[90] flex flex-col items-center justify-center",
            "bg-background/95 backdrop-blur-md",
            "animate-in fade-in duration-200"
        )}>
            {onCancel && (
                <Button 
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 h-10 w-10"
                    onClick={onCancel}
                    aria-label="Закрыть"
                >
                    <X size={24} />
                </Button>
            )}
            <div className="relative flex items-center justify-center mb-8">
                <div className="absolute w-32 h-32 rounded-full bg-destructive/20 animate-ping" />
                <div className="absolute w-24 h-24 rounded-full bg-destructive/30 animate-pulse" />
                <div className="relative w-20 h-20 rounded-full bg-destructive flex items-center justify-center">
                    <Mic size={40} className="text-white" />
                </div>
            </div>
            <p className="text-2xl font-semibold mb-2">Идет запись...</p>
            <p className="text-muted-foreground">Отпустите для отправки</p>
        </div>
    )
}
