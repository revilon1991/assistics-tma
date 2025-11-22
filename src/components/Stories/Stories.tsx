import {useState, useEffect, useRef, useCallback} from 'react'
import './Stories.css'

interface Story {
    id: number
    title?: string
    description?: string
    image?: string
    videoUrl?: string
}

interface StoriesProps {
    stories: Story[]
    onComplete: () => void
    onClose: () => void
}

const TEXT_STORY_DURATION = 8000

export const Stories = ({stories, onComplete, onClose}: StoriesProps) => {
    const validStories = stories.filter(story => {
        if (story.videoUrl) {
            return story.videoUrl.trim() !== ''
        }
        return true
    })

    const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
    const [progress, setProgress] = useState(0)
    const [videoDuration, setVideoDuration] = useState<number | null>(null)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const touchStartX = useRef<number>(0)
    const touchEndX = useRef<number>(0)

    const currentStory = validStories[currentStoryIndex]
    const isVideoStory = !!(currentStory?.videoUrl && currentStory.videoUrl.trim() !== '')

    const nextStory = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }
        setProgress(0)
        setVideoDuration(null)
        if (currentStoryIndex < validStories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1)
        } else {
            onComplete()
        }
    }, [currentStoryIndex, validStories.length, onComplete])

    const prevStory = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }
        setProgress(0)
        setVideoDuration(null)
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1)
        }
    }, [currentStoryIndex])

    const handleVideoTimeUpdate = useCallback(() => {
        if (videoRef.current && videoDuration) {
            const currentTime = videoRef.current.currentTime
            const newProgress = (currentTime / videoDuration) * 100
            setProgress(newProgress)
        }
    }, [videoDuration])

    const startProgress = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }

        setProgress(0)
        
        if (isVideoStory) {
            return
        }

        const startTime = Date.now()
        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime
            const newProgress = Math.min((elapsed / TEXT_STORY_DURATION) * 100, 100)
            setProgress(newProgress)

            if (newProgress >= 100) {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                }
                nextStory()
            }
        }, 16)
    }, [currentStoryIndex, isVideoStory, nextStory])

    const handleVideoLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget
        if (video.duration && isFinite(video.duration)) {
            setVideoDuration(video.duration)
        }
    }

    const handleVideoEnded = () => {
        nextStory()
    }

    const handleVideoError = () => {
        console.error('Ошибка загрузки видео, переходим к следующей истории')
        nextStory()
    }

    useEffect(() => {
        if (isVideoStory && videoRef.current) {
            const video = videoRef.current
            video.play().catch(console.error)
            video.addEventListener('timeupdate', handleVideoTimeUpdate)
            return () => {
                video.removeEventListener('timeupdate', handleVideoTimeUpdate)
                video.pause()
            }
        } else {
            startProgress()
            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                }
            }
        }
    }, [startProgress, isVideoStory, handleVideoTimeUpdate])

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }
        if (videoRef.current && isVideoStory) {
            videoRef.current.pause()
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
                nextStory()
            } else {
                prevStory()
            }
        } else {
            if (isVideoStory && videoRef.current) {
                videoRef.current.play().catch(console.error)
            } else {
                startProgress()
            }
        }
    }

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const width = rect.width

        if (clickX < width / 2) {
            prevStory()
        } else {
            nextStory()
        }
    }

    if (!currentStory || validStories.length === 0) {
        return null
    }

    return (
        <div className="stories-overlay" onClick={handleClick}
             onTouchStart={handleTouchStart}
             onTouchMove={handleTouchMove}
             onTouchEnd={handleTouchEnd}>
            <div className="stories-container">
                <div className="stories-progress-container">
                    {validStories.map((_, index) => (
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

                <button className="stories-close" onClick={onClose} aria-label="Закрыть">
                    ✕
                </button>

                <div className="stories-content">
                    {isVideoStory ? (
                        <div className="stories-video-container">
                            <video
                                ref={videoRef}
                                src={currentStory.videoUrl}
                                className="stories-video"
                                playsInline
                                muted
                                onLoadedMetadata={handleVideoLoadedMetadata}
                                onEnded={handleVideoEnded}
                                onError={handleVideoError}
                            />
                        </div>
                    ) : (
                        <div className="stories-story">
                            {currentStory.title && (
                                <h2 className="stories-title">{currentStory.title}</h2>
                            )}
                            {currentStory.description && (
                                <p className="stories-description">{currentStory.description}</p>
                            )}
                            {currentStory.image && (
                                <div className="stories-image-container">
                                    <img src={currentStory.image} alt={currentStory.title || 'Story'} className="stories-image"/>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="stories-indicator">
                    {currentStoryIndex + 1} / {validStories.length}
                </div>
            </div>
        </div>
    )
}

