import '@/components/Loader/Loader.css'

interface LoaderProps {
    isVisible: boolean
}

export function Loader({ isVisible }: LoaderProps) {
    if (!isVisible) return null

    return (
        <div className="loader-overlay">
            <div className="loader-content">
                <div className="loader-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>
                <p className="loader-text">Загрузка...</p>
            </div>
        </div>
    )
}
