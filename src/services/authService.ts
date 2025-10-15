import {TokenResponse, AuthTokens} from '@/types/index.ts'

class AuthService {
    private readonly baseUrl = import.meta.env.VITE_IDP_BASE_URL
    private readonly clientId = 'telegram-mini-app'
    private readonly resource = 'https://assistant'
    private readonly scopeList = ['assistant:read', 'assistant:write']
    private readonly subjectIssuer = '5002625055'
    
    private refreshTimer: NodeJS.Timeout | null = null
    private readonly TOKEN_STORAGE_KEY = 'auth_tokens'

    private async getStoredTokens(): Promise<AuthTokens | null> {
        return new Promise((resolve) => {
            const tg = window.Telegram?.WebApp
            if (!tg?.SecureStorage) {
                resolve(null)
                return
            }

            tg.SecureStorage.getItem(this.TOKEN_STORAGE_KEY, (err, value) => {
                if (err || !value) {
                    resolve(null)
                    return
                }

                try {
                    const tokens = JSON.parse(value) as AuthTokens
                    resolve(tokens)
                } catch {
                    resolve(null)
                }
            })
        })
    }

    private async storeTokens(tokens: AuthTokens): Promise<void> {
        return new Promise((resolve, reject) => {
            const tg = window.Telegram?.WebApp
            if (!tg?.SecureStorage) {
                reject(new Error('SecureStorage недоступен'))
                return
            }

            tg.SecureStorage.setItem(this.TOKEN_STORAGE_KEY, JSON.stringify(tokens), (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }

    private async clearStoredTokens(): Promise<void> {
        return new Promise((resolve, reject) => {
            const tg = window.Telegram?.WebApp
            if (!tg?.SecureStorage) {
                resolve()
                return
            }

            tg.SecureStorage.removeItem(this.TOKEN_STORAGE_KEY, (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }

    private async requestTokens(subjectToken: string, grantType: 'token-exchange' | 'refresh_token', refreshToken?: string): Promise<TokenResponse> {
        const body: any = {
            client_id: this.clientId,
            resource: this.resource,
            scope_list: this.scopeList,
            grant_type: grantType === 'token-exchange' 
                ? 'urn:ietf:params:oauth:grant-type:token-exchange'
                : 'refresh_token'
        }

        if (grantType === 'token-exchange') {
            body.auth_method = 'none'
            body.subject_token_type = 'urn:assistant-idp:token-type:telegram-init-data;v=1'
            body.subject_token = subjectToken
            body.subject_issuer = this.subjectIssuer
        } else if (refreshToken) {
            body.refresh_token = refreshToken
        }

        const response = await fetch(`${this.baseUrl}/oauth/token`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`)
        }

        return response.json()
    }

    private convertToAuthTokens(tokenResponse: TokenResponse): AuthTokens {
        const now = Math.floor(Date.now() / 1000)
        return {
            accessToken: tokenResponse.access_token,
            refreshToken: tokenResponse.refresh_token,
            expiresAt: now + tokenResponse.expires_in,
            issuedAt: tokenResponse.issued_at
        }
    }

    private needsRefresh(tokens: AuthTokens): boolean {
        const now = Math.floor(Date.now() / 1000)

        return tokens.expiresAt - now < 60
    }

    private setRefreshTimer(tokens: AuthTokens): void {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer)
        }

        const now = Math.floor(Date.now() / 1000)
        const timeUntilRefresh = Math.max(0, tokens.expiresAt - now - 60) * 1000

        this.refreshTimer = setTimeout(() => {
            this.refreshTokens().catch(console.error)
        }, timeUntilRefresh)
    }

    async authenticate(tmaInitData: string): Promise<AuthTokens> {
        try {
            console.log('Начинаем авторизацию...')
            
            const tokenResponse = await this.requestTokens(tmaInitData, 'token-exchange')
            const tokens = this.convertToAuthTokens(tokenResponse)
            
            await this.storeTokens(tokens)
            this.setRefreshTimer(tokens)
            
            console.log('Авторизация успешна')
            return tokens
        } catch (error) {
            console.error('Ошибка авторизации:', error)
            throw error
        }
    }

    async refreshTokens(): Promise<AuthTokens> {
        try {
            console.log('Обновляем токены...')
            
            const storedTokens = await this.getStoredTokens()
            if (!storedTokens) {
                throw new Error('Нет сохраненных токенов для обновления')
            }

            const tokenResponse = await this.requestTokens('', 'refresh_token', storedTokens.refreshToken)
            const tokens = this.convertToAuthTokens(tokenResponse)
            
            await this.storeTokens(tokens)
            this.setRefreshTimer(tokens)
            
            console.log('Токены успешно обновлены')
            return tokens
        } catch (error) {
            console.error('Ошибка обновления токенов:', error)

            await this.clearStoredTokens()
            throw error
        }
    }

    async getTokens(): Promise<AuthTokens | null> {
        const tokens = await this.getStoredTokens()
        
        if (!tokens) {
            return null
        }

        if (this.needsRefresh(tokens)) {
            try {
                return await this.refreshTokens()
            } catch {
                return null
            }
        }

        return tokens
    }

    async isAuthenticated(): Promise<boolean> {
        const tokens = await this.getTokens()
        return tokens !== null
    }

    async logout(): Promise<void> {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer)
            this.refreshTimer = null
        }
        
        await this.clearStoredTokens()
        console.log('Выход из системы выполнен')
    }

    async getAccessToken(): Promise<string | null> {
        const tokens = await this.getTokens()
        return tokens?.accessToken || null
    }
}

export const authService = new AuthService()
