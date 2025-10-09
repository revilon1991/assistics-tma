import {useEffect} from 'react'
import {Chat} from '@/components/Chat/Chat'
import {Sidebar} from '@/components/Sidebar/Sidebar'
import {Toast} from '@/components/Toast/Toast'
import {Loader} from '@/components/Loader/Loader'
import {useAppStore} from '@/stores/appStore'
import {expandViewport, init, miniAppReady, bindThemeParamsCssVars, mountThemeParamsSync} from '@telegram-apps/sdk';
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
    const {initializeApp, toasts, isLoading} = useAppStore()

    useEffect(() => {
        const initTelegram = async () => {
            try {
                init();

                const tg = window.Telegram?.WebApp

                if (tg) {
                    tg.ready()
                    tg.expand()
                }

                if (mountThemeParamsSync.isAvailable()) {
                    mountThemeParamsSync()
                }

                if (bindThemeParamsCssVars.isAvailable()) {
                    bindThemeParamsCssVars()
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
            <Loader isVisible={isLoading}/>
        </div>
    )
}

export default App
