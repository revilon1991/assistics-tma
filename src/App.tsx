import {useEffect} from 'react'
import {Chat} from './components/Chat/Chat'
import {Sidebar} from './components/Sidebar/Sidebar'
import {Toast} from './components/Toast/Toast'
import {useAppStore} from './stores/appStore'
import './App.css'

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
        const initTelegram = async () => {
            try {
                const tg = window.Telegram?.WebApp
                if (tg) {
                    tg.ready()
                    tg.expand()

                    console.log('Telegram WebApp initialized')
                    console.log('User:', tg.initDataUnsafe?.user)
                    console.log('InitData:', tg.initData)
                }

                await initializeApp()
            } catch (error) {
                console.error('Failed to initialize Telegram WebApp:', error)
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
