import {useEffect} from 'react'
import {Chat} from '@/components/Chat/Chat'
import {Sidebar} from '@/components/Sidebar/Sidebar'
import {Toast} from '@/components/Toast/Toast'
import {Loader} from '@/components/Loader/Loader'
import {Stories} from '@/components/Stories/Stories'
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

const ONBOARDING_STORIES = [
    {
        id: 1,
        title: 'Добро пожаловать!',
        description: 'Это ваш персональный AI-ассистент, готовый помочь вам в любое время. Этот помощник умеет отвечать на вопросы, помогать с задачами и поддерживать беседу. Позвольте показать вам, как это работает.'
    },
    {
        id: 2,
        videoUrl: 'https://dev.ui.assistics.net/static/doctor.mp4'
    },
    {
        id: 3,
        videoUrl: 'https://dev.ui.assistics.net/static/font.mp4'
    },
    {
        id: 4,
        videoUrl: 'https://dev.ui.assistics.net/static/bills.mp4'
    },
    {
        id: 5,
        videoUrl: 'https://dev.ui.assistics.net/static/wifi.mp4'
    },
    {
        id: 6,
        videoUrl: 'https://dev.ui.assistics.net/static/cooking.mp4'
    },
]

function App() {
    const {initializeApp, toasts, isLoading, showOnboarding, completeOnboarding, setShowOnboarding} = useAppStore()

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

    const handleStoriesComplete = () => {
        completeOnboarding()
    }

    const handleStoriesClose = () => {
        setShowOnboarding(false)
        completeOnboarding()
    }

    return (
        <div className="app">
            <Sidebar/>
            <Chat/>
            <Toast messages={toasts}/>
            <Loader isVisible={isLoading}/>
            {showOnboarding && (
                <Stories
                    stories={ONBOARDING_STORIES}
                    onComplete={handleStoriesComplete}
                    onClose={handleStoriesClose}
                />
            )}
        </div>
    )
}

export default App
