import {useState, useEffect, useRef, useCallback} from 'react'
import './Stories.css'

interface Story {
    id: number
    title: string
    description: string
    image?: string
}

interface StoriesProps {
    stories: Story[]
    onComplete: () => void
    onClose: () => void
}

const STORY_DURATION = 5000 // 5 секунд на историю

export const Stories = ({stories, onComplete, onClose}: StoriesProps) => {
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
    const [progress, setProgress] = useState(0)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const touchStartX = useRef<number>(0)
    const touchEndX = useRef<number>(0)

    const currentStory = stories[currentStoryIndex]

    const startProgress = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }

        setProgress(0)
        const startTime = Date.now()

        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime
            const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100)
            setProgress(newProgress)

            if (newProgress >= 100) {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                }
                nextStory()
            }
        }, 16) // ~60fps
    }, [currentStoryIndex])

    const nextStory = useCallback(() => {
        if (currentStoryIndex < stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1)
        } else {
            onComplete()
        }
    }, [currentStoryIndex, stories.length, onComplete])

    const prevStory = useCallback(() => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1)
        }
    }, [currentStoryIndex])

    useEffect(() => {
        startProgress()
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [startProgress])

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX
    }

    const handleTouchEnd = () => {
        const diff = touchStartX.current - touchEndX.current
        const threshold = 50

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // Свайп влево - следующая история
                nextStory()
            } else {
                // Свайп вправо - предыдущая история
                prevStory()
            }
        } else {
            // Небольшой свайп - продолжить текущую историю
            startProgress()
        }
    }

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const width = rect.width

        if (clickX < width / 2) {
            // Клик слева - предыдущая история
            prevStory()
        } else {
            // Клик справа - следующая история
            nextStory()
        }
    }

    if (!currentStory) {
        return null
    }

    return (
        <div className="stories-overlay" onClick={handleClick}
             onTouchStart={handleTouchStart}
             onTouchMove={handleTouchMove}
             onTouchEnd={handleTouchEnd}>
            <div className="stories-container">
                {/* Прогресс-бары */}
                <div className="stories-progress-container">
                    {stories.map((_, index) => (
                        <div key={index} className="stories-progress-bar">
                            <div
                                className={`stories-progress-fill ${index === currentStoryIndex ? 'active' : ''} ${index < currentStoryIndex ? 'completed' : ''}`}
                                style={{
                                    width: index === currentStoryIndex ? `${progress}%` : index < currentStoryIndex ? '100%' : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Кнопка закрытия */}
                <button className="stories-close" onClick={onClose} aria-label="Закрыть">
                    ✕
                </button>

                {/* Контент истории */}
                <div className="stories-content">
                    <div className="stories-story">
                        <h2 className="stories-title">{currentStory.title}</h2>
                        <p className="stories-description">{currentStory.description}</p>
                        {currentStory.image && (
                            <div className="stories-image-container">
                                <img src={currentStory.image} alt={currentStory.title} className="stories-image"/>
                            </div>
                        )}
                    </div>
                </div>

                {/* Индикатор истории */}
                <div className="stories-indicator">
                    {currentStoryIndex + 1} / {stories.length}
                </div>
            </div>
        </div>
    )
}

