import {useEffect} from 'react'
import {Chat} from '@/components/Chat/Chat'
import {Sidebar} from '@/components/Sidebar/Sidebar'
import {Toast} from '@/components/Toast/Toast'
import {Loader} from '@/components/Loader/Loader'
import {useAppStore} from '@/stores/appStore'
import {expandViewport, init, miniAppReady, bindThemeParamsCssVars, mountThemeParamsSync, isTMA, disableVerticalSwipes} from '@telegram-apps/sdk';
import '@/App.css'
import {SecureStorage} from '@/types/tma'

declare global {
    interface Window {
        Telegram?: {
            WebApp?: {
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
                if (!await isTMA('complete')) {
                    throw new Error('TMA is launched without telegram app.')
                }

                init()

                await initializeApp()

                mountThemeParamsSync.ifAvailable()
                bindThemeParamsCssVars.ifAvailable()
                miniAppReady.ifAvailable()
                expandViewport.ifAvailable()
                disableVerticalSwipes.ifAvailable()
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
