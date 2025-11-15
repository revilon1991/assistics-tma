import { cn } from '@/lib/utils'

interface SkeletonProps {
    isVisible: boolean
}

export function Skeleton({ isVisible }: SkeletonProps) {
    if (!isVisible) return null

    return (
        <div className={cn(
            "fixed inset-0 z-[100] flex flex-col",
            "bg-background",
            "animate-in fade-in duration-200"
        )}>
            {/* Header skeleton */}
            <div className="flex items-center gap-3 p-4 border-b">
                <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                    <div className="h-3 bg-muted rounded animate-pulse w-1/4" />
                </div>
            </div>

            {/* Chat messages skeleton */}
            <div className="flex-1 p-4 space-y-4 overflow-hidden">
                {/* User message */}
                <div className="flex justify-end">
                    <div className="max-w-[80%] space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse w-32" />
                        <div className="h-4 bg-muted rounded animate-pulse w-24" />
                    </div>
                </div>

                {/* Bot message */}
                <div className="flex justify-start gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full animate-pulse flex-shrink-0" />
                    <div className="flex-1 max-w-[80%] space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse w-full" />
                        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                    </div>
                </div>

                {/* User message */}
                <div className="flex justify-end">
                    <div className="max-w-[80%] space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse w-40" />
                    </div>
                </div>

                {/* Bot message */}
                <div className="flex justify-start gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full animate-pulse flex-shrink-0" />
                    <div className="flex-1 max-w-[80%] space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse w-full" />
                        <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
                        <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                        <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                    </div>
                </div>

                {/* User message */}
                <div className="flex justify-end">
                    <div className="max-w-[80%] space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse w-28" />
                        <div className="h-4 bg-muted rounded animate-pulse w-36" />
                    </div>
                </div>

                {/* Loading bot message */}
                <div className="flex justify-start gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full animate-pulse flex-shrink-0" />
                    <div className="flex-1 max-w-[80%] space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                        <div className="flex items-center gap-1 mt-2">
                            <div className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Input skeleton */}
            <div className="p-4 border-t">
                <div className="flex items-end gap-2">
                    <div className="flex-1 h-10 bg-muted rounded-lg animate-pulse" />
                    <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
                </div>
            </div>
        </div>
    )
}
