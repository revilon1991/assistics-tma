import React, { useState, useRef, useEffect } from 'react'
import './DebugPanel.css'

// Error boundary для дебаг панели
class DebugPanelErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('DebugPanel Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="debug-panel-container">
          <button className="debug-panel-toggle" style={{ background: 'red' }}>
            ERR
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export interface DebugLogEntry {
  id: string
  timestamp: string
  type: 'log' | 'error'
  message: string
  data?: any
}

interface DebugPanelProps {
  logs: DebugLogEntry[]
  onClear: () => void
  maxHeight?: string
}

const DebugPanel: React.FC<DebugPanelProps> = ({ 
  logs, 
  onClear, 
  maxHeight = '30vh' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [logs])


  const syntaxHighlight = (json: any): string => {
    try {
      let jsonString: string
      if (typeof json !== 'string') {
        jsonString = JSON.stringify(json, null, 2)
      } else {
        jsonString = json
      }

      // Escape HTML
      jsonString = jsonString
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

      // Apply syntax highlighting
      return jsonString.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
        (match) => {
          let className = 'json-number'
          if (/^"/.test(match)) {
            className = /:$/.test(match) ? 'json-key' : 'json-string'
          } else if (/true|false/.test(match)) {
            className = 'json-boolean'
          } else if (/null/.test(match)) {
            className = 'json-null'
          }
          return `<span class="${className}">${match}</span>`
        }
      )
    } catch (error) {
      console.error('Syntax highlight error:', error)
      return String(json)
    }
  }

  const renderLogContent = (entry: DebugLogEntry) => {
    const parts: Array<{ text: string; isJson: boolean }> = []
    
    // Add main message
    parts.push({ text: entry.message, isJson: false })

    if (entry.data) {
      try {
        // Try to parse as JSON if it's a string that looks like JSON
        if (typeof entry.data === 'string' && /^\s*[{[]/.test(entry.data)) {
          try {
            const parsed = JSON.parse(entry.data)
            parts.push({ text: JSON.stringify(parsed, null, 2), isJson: true })
          } catch {
            parts.push({ text: entry.data, isJson: false })
          }
        } else if (typeof entry.data === 'object') {
          parts.push({ text: JSON.stringify(entry.data, null, 2), isJson: true })
        } else {
          parts.push({ text: String(entry.data), isJson: false })
        }
      } catch {
        parts.push({ text: String(entry.data), isJson: false })
      }
    }

    return parts
  }

  if (!isExpanded) {
    return (
      <div className="debug-panel-container">
        <button 
          className="debug-panel-toggle"
          onClick={() => setIsExpanded(true)}
        >
          DBG
        </button>
      </div>
    )
  }

  return (
    <div className="debug-panel-container expanded">
      <div className="debug-panel" style={{ maxHeight }}>
        <div className="debug-panel-header">
          <div className="debug-panel-title">TMA Debug Console</div>
          <div className="debug-panel-controls">
            <button 
              className="debug-panel-btn"
              onClick={onClear}
            >
              Clear
            </button>
            <button 
              className="debug-panel-btn"
              onClick={() => setIsExpanded(false)}
            >
              Close
            </button>
          </div>
        </div>
        <div 
          className="debug-panel-messages" 
          ref={messagesRef}
        >
          {logs.map((entry) => {
            const contentParts = renderLogContent(entry)
            return (
              <div 
                key={entry.id}
                className={`debug-log-entry ${entry.type}`}
              >
                <div className="debug-log-header">
                  {entry.timestamp} — {entry.type.toUpperCase()}
                </div>
                <div className="debug-log-body">
                  {contentParts.map((part, index) => (
                    part.isJson ? (
                      <pre 
                        key={index}
                        className="debug-log-part"
                        dangerouslySetInnerHTML={{ 
                          __html: syntaxHighlight(part.text)
                        }}
                      />
                    ) : (
                      <pre 
                        key={index}
                        className="debug-log-part"
                      >
                        {part.text}
                      </pre>
                    )
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const DebugPanelWithErrorBoundary: React.FC<DebugPanelProps> = (props) => (
  <DebugPanelErrorBoundary>
    <DebugPanel {...props} />
  </DebugPanelErrorBoundary>
)

export default DebugPanelWithErrorBoundary
