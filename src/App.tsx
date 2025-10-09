import {useEffect} from 'react'
import {Chat} from '@/components/Chat/Chat'
import {Sidebar} from '@/components/Sidebar/Sidebar'
import {Toast} from '@/components/Toast/Toast'
import {useAppStore} from '@/stores/appStore'
import {expandViewport, init, miniAppReady} from '@telegram-apps/sdk';
import '@/App.css'
import {SecureStorage} from '@/types/tma'

declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
                ready: typeof miniAppReady
                expand: typeof expandViewport
                initData: string
                SecureStorage: SecureStorage
            }
        }
    }
}

function App() {
    const {initializeApp, toasts} = useAppStore()

    useEffect(() => {
        const initTelegram = async () => {
            try {
                init();

                const tg = window.Telegram?.WebApp

                if (tg) {
                    console.log(tg)
                    tg.ready()
                    tg.expand()

                    console.log('InitData:', tg.initData)
                }

                await initializeApp()
            } catch (error) {
                console.error('Failed to initialize Telegram WebApp:', error)
            }
        }

        initTelegram().finally()
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
