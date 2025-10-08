import {useEffect} from 'react'
import {Chat} from './components/Chat/Chat'
import {Sidebar} from './components/Sidebar/Sidebar'
import {Toast} from './components/Toast/Toast'
import {useAppStore} from './stores/appStore'
import './App.css'

// Объявляем глобальный интерфейс для Telegram WebApp
declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                ready: () => void
                expand: () => void
                initData: string
                initDataUnsafe: any
                user?: any
                colorScheme: string
                onEvent: (event: string, callback: () => void) => void
            }
        }
    }
}

function App() {
    const {initializeApp, toasts} = useAppStore()

    useEffect(() => {
        // Инициализация Telegram WebApp
        const initTelegram = async () => {
            try {
                const tg = window.Telegram?.WebApp
                if (tg) {
                    // Инициализируем Telegram WebApp
                    tg.ready()
                    tg.expand()

                    console.log('Telegram WebApp initialized')
                    console.log('User:', tg.initDataUnsafe?.user)
                    console.log('InitData:', tg.initData)
                }

                // Инициализируем приложение
                await initializeApp()
            } catch (error) {
                console.error('Failed to initialize Telegram WebApp:', error)
                // Инициализируем в demo режиме
                await initializeApp()
            }
        }

        initTelegram()
    }, [initializeApp])

    return (
        <div className="app">
            <Sidebar/>
            <Chat/>
            <Toast messages={toasts}/>
        </div>
    )
}

export default App
