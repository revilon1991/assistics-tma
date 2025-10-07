import { useState, useEffect, useCallback, useRef } from 'react'
import { DebugLogEntry } from '../components/DebugPanel/DebugPanel'

const MAX_BYTES_WARNING = 1_048_576 // 1 MB
const TRUNCATE_AT_BYTES = 1_048_576 // 1 MB

interface UseDebugLoggerReturn {
  logs: DebugLogEntry[]
  clearLogs: () => void
  addLog: (type: 'log' | 'error', message: string, data?: any) => void
}

export const useDebugLogger = (): UseDebugLoggerReturn => {
  const [logs, setLogs] = useState<DebugLogEntry[]>([])
  const originalFetch = useRef<typeof fetch>()
  const originalXHR = useRef<typeof XMLHttpRequest>()

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const formatTimestamp = () => new Date().toISOString()

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  const truncateByBytes = (str: string, maxBytes: number) => {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(str)
    
    if (bytes.length <= maxBytes) {
      return { text: str, size: bytes.length, truncated: false }
    }

    let low = 0
    let high = str.length
    
    while (low < high) {
      const mid = Math.ceil((low + high) / 2)
      const len = encoder.encode(str.slice(0, mid)).length
      if (len <= maxBytes) {
        low = mid
      } else {
        high = mid - 1
      }
    }

    let prefix = str.slice(0, low)
    while (encoder.encode(prefix).length > maxBytes) {
      prefix = prefix.slice(0, -1)
    }

    return { text: prefix, size: bytes.length, truncated: true }
  }

  const addLog = useCallback((type: 'log' | 'error', message: string, data?: any) => {
    const entry: DebugLogEntry = {
      id: generateId(),
      timestamp: formatTimestamp(),
      type,
      message,
      data
    }

    setLogs(prev => [...prev, entry])
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  // Setup fetch interceptor
  useEffect(() => {
    if (!window.fetch || originalFetch.current) return

    originalFetch.current = window.fetch.bind(window)

    window.fetch = async function(resource: RequestInfo | URL, init?: RequestInit) {
      const method = (init && init.method) || 'GET'
      addLog('log', `[fetch -> ${method}]`, String(resource))
      
      const start = Date.now()
      
      try {
        const response = await originalFetch.current!(resource, init)
        const elapsed = Date.now() - start
        
        let responseText = ''
        let size = 0
        let isBinary = false

        try {
          responseText = await response.clone().text()
          size = new TextEncoder().encode(responseText).length
        } catch {
          try {
            const blob = await response.clone().blob()
            size = blob.size || 0
            isBinary = true
          } catch (e) {
            responseText = `<cannot-read-body: ${e}>`
          }
        }

        if (isBinary) {
          addLog('log', `[fetch res ${response.status} ${elapsed}ms] ${resource} — binary ${formatBytes(size)}`)
        } else {
          if (size > MAX_BYTES_WARNING) {
            addLog('log', `[fetch res ${response.status} ${elapsed}ms] ${resource} — ${formatBytes(size)} (truncated to ${formatBytes(TRUNCATE_AT_BYTES)})`)
          }
          
          const { text, truncated } = truncateByBytes(responseText, TRUNCATE_AT_BYTES)
          
          if (truncated) {
            addLog('log', `[fetch res ${response.status} ${elapsed}ms] ${resource} — body (TRUNCATED):`, 
              text + `\n\n[...truncated ${formatBytes(size - TRUNCATE_AT_BYTES)}]`)
          } else {
            addLog('log', `[fetch res ${response.status} ${elapsed}ms] ${resource}`, text)
          }
        }

        return response
      } catch (error) {
        addLog('error', '[fetch ERROR]', `${resource} ${error}`)
        throw error
      }
    }

    return () => {
      if (originalFetch.current) {
        window.fetch = originalFetch.current
        originalFetch.current = undefined
      }
    }
  }, [addLog])

  // Setup XHR interceptor
  useEffect(() => {
    if (!window.XMLHttpRequest || originalXHR.current) return

    originalXHR.current = window.XMLHttpRequest

    function WrappedXHR() {
      const xhr = new originalXHR.current!()
      let url = ''
      let method = ''

      const originalOpen = xhr.open
      xhr.open = function(m: string, u: string | URL, ...args: any[]) {
        method = m
        url = String(u)
        return originalOpen.apply(this, [m, u, ...args] as any)
      }

      const originalSend = xhr.send
      xhr.send = function(body?: Document | XMLHttpRequestBodyInit | null) {
        this.addEventListener('loadend', () => {
          try {
            const responseText = this.responseText || ''
            const bytes = new TextEncoder().encode(responseText).length

            if (bytes > MAX_BYTES_WARNING) {
              addLog('log', `[XHR ${this.status}] ${method} ${url} — ${formatBytes(bytes)} (truncated to ${formatBytes(TRUNCATE_AT_BYTES)})`)
            }

            const { text, truncated } = truncateByBytes(responseText, TRUNCATE_AT_BYTES)

            if (truncated) {
              addLog('log', `[XHR ${this.status}] ${method} ${url} — body (TRUNCATED):`, 
                text + `\n\n[...truncated ${formatBytes(bytes - TRUNCATE_AT_BYTES)}]`)
            } else {
              addLog('log', `[XHR ${this.status}] ${method} ${url}`, responseText || '<empty>')
            }
          } catch (error) {
            addLog('error', '[XHR read ERROR]', `${method} ${url} ${String(error)}`)
          }
        })

        return originalSend.call(this, body)
      }

      return xhr
    }

    WrappedXHR.prototype = originalXHR.current.prototype
    window.XMLHttpRequest = WrappedXHR as any

    return () => {
      if (originalXHR.current) {
        window.XMLHttpRequest = originalXHR.current
        originalXHR.current = undefined
      }
    }
  }, [addLog])

  // Initialize with basic info and setup global debug object
  useEffect(() => {
    addLog('log', 'location.search', location.search || '(none)')
    
    if (window.Telegram && (window as any).Telegram.WebApp) {
      try {
        const tg = (window as any).Telegram.WebApp
        addLog('log', 'telegram.initData', tg.initData)
        addLog('log', 'telegram.isExpanded', tg.isExpanded)
      } catch (error) {
        addLog('error', 'error reading Telegram.WebApp', String(error))
      }
    } else {
      addLog('log', 'Telegram.WebApp not present (running in browser?)')
    }

    // Setup global debug functions for compatibility
    ;(window as any).TMA_DBG = {
      log: (...args: any[]) => addLog('log', args.join(' ')),
      err: (...args: any[]) => addLog('error', args.join(' ')),
      clear: clearLogs
    }

    // Also setup shorter alias
    ;(window as any).dbg = (...args: any[]) => addLog('log', args.join(' '))

    return () => {
      // Cleanup global objects
      delete (window as any).TMA_DBG
      delete (window as any).dbg
    }
  }, [addLog, clearLogs])

  return {
    logs,
    clearLogs,
    addLog
  }
}
