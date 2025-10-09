import {type ClassValue, clsx} from 'clsx'

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs)
}

export function generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function uuidV7(): string {
    const timestamp = Date.now()
    const randomBytes = new Uint8Array(10)
    crypto.getRandomValues(randomBytes)

    const timestampHex = timestamp.toString(16).padStart(12, '0')

    const randomHex = Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

    return [
        timestampHex.slice(0, 8),
        timestampHex.slice(8, 12),
        '7' + randomHex.slice(0, 3),
        ((parseInt(randomHex.slice(3, 4), 16) & 0x3) | 0x8).toString(16) + randomHex.slice(4, 7),
        randomHex.slice(7, 19)
    ].join('-')
}

export function formatTime(timestamp: number | Date): string {
    const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : timestamp

    if (isNaN(date.getTime())) {
        return '--:--'
    }

    return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    })
}

export function formatDate(timestamp: number | Date): string {
    const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : timestamp

    if (isNaN(date.getTime())) {
        return 'Неизвестно'
    }

    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
        return 'Сегодня'
    } else if (days === 1) {
        return 'Вчера'
    } else if (days < 7) {
        return `${days} дней назад`
    } else {
        return date.toLocaleDateString('ru-RU')
    }
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text
    }
    return text.substring(0, maxLength) + '...'
}

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null

    return (...args: Parameters<T>) => {
        if (timeout) {
            clearTimeout(timeout)
        }

        timeout = setTimeout(() => {
            func(...args)
        }, wait)
    }
}

export function isValidUrl(string: string): boolean {
    try {
        new URL(string)
        return true
    } catch (_) {
        return false
    }
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
}
