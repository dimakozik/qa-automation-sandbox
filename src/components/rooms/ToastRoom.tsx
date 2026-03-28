import { useState, useCallback, useEffect } from 'react'
import type { Toast } from '../../types'

const TOAST_DURATION = 3000

const PRESETS: { label: string; type: Toast['type']; message: string }[] = [
  { label: 'Success',  type: 'success', message: 'Operation completed successfully!' },
  { label: 'Error',    type: 'error',   message: 'Something went wrong. Please try again.' },
  { label: 'Warning',  type: 'warning', message: 'Proceed with caution — action is irreversible.' },
  { label: 'Info',     type: 'info',    message: 'Your session will expire in 5 minutes.' },
]

const STYLE: Record<Toast['type'], string> = {
  success: 'bg-green-50 border-green-400 text-green-800',
  error:   'bg-red-50   border-red-400   text-red-800',
  warning: 'bg-amber-50 border-amber-400 text-amber-800',
  info:    'bg-blue-50  border-blue-400  text-blue-800',
}

const ICON: Record<Toast['type'], string> = {
  success: '✓',
  error:   '✗',
  warning: '⚠',
  info:    'ℹ',
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast
  onDismiss: (id: string) => void
}) {
  useEffect(() => {
    const id = setTimeout(() => onDismiss(toast.id), TOAST_DURATION)
    return () => clearTimeout(id)
  }, [toast.id, onDismiss])

  return (
    <div
      data-testid={`toast-${toast.id}`}
      data-toast-type={toast.type}
      className={`flex items-start gap-3 px-4 py-3 border rounded-lg shadow-md text-sm w-80 ${STYLE[toast.type]}`}
      role="alert"
      aria-live="polite"
    >
      <span className="font-bold text-base leading-none mt-0.5">{ICON[toast.type]}</span>
      <p data-testid={`toast-message-${toast.id}`} className="flex-1 font-medium">
        {toast.message}
      </p>
      <button
        data-testid={`toast-dismiss-${toast.id}`}
        onClick={() => onDismiss(toast.id)}
        className="opacity-60 hover:opacity-100 text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}

export default function ToastRoom() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [customMessage, setCustomMessage] = useState('')
  const [customType, setCustomType] = useState<Toast['type']>('info')
  const [counter, setCounter] = useState(0)

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  function addToast(type: Toast['type'], message: string) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setToasts((t) => [...t, { id, type, message }])
    setCounter((c) => c + 1)
  }

  function addCustomToast() {
    if (!customMessage.trim()) return
    addToast(customType, customMessage)
    setCustomMessage('')
  }

  function dismissAll() {
    setToasts([])
  }

  return (
    <div data-testid="toast-room" className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Toast &amp; Alerts</h1>
        <p className="text-sm text-gray-500">
          Transient elements that auto-dismiss after {TOAST_DURATION / 1000}s. Tests Playwright's{' '}
          <code>waitForSelector</code>, <code>toBeVisible</code>, and timing-sensitive assertions.
        </p>
      </div>

      {/* Preset triggers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Quick Fire</h2>
        <div className="grid grid-cols-2 gap-3">
          {PRESETS.map(({ label, type, message }) => (
            <button
              key={type}
              data-testid={`toast-trigger-${type}`}
              onClick={() => addToast(type, message)}
              className={`py-2 px-4 rounded-lg text-sm font-medium border transition-colors ${
                type === 'success' ? 'border-green-300 text-green-700 hover:bg-green-50' :
                type === 'error'   ? 'border-red-300   text-red-700   hover:bg-red-50'   :
                type === 'warning' ? 'border-amber-300 text-amber-700 hover:bg-amber-50' :
                                     'border-blue-300  text-blue-700  hover:bg-blue-50'
              }`}
            >
              {ICON[type]} {label} Toast
            </button>
          ))}
        </div>
      </div>

      {/* Custom toast builder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Custom Toast</h2>
        <div className="flex gap-3">
          <select
            data-testid="custom-toast-type"
            value={customType}
            onChange={(e) => setCustomType(e.target.value as Toast['type'])}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="success">Success</option>
            <option value="error">Error</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
          <input
            data-testid="custom-toast-message"
            type="text"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomToast()}
            placeholder="Custom message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            data-testid="custom-toast-trigger"
            onClick={addCustomToast}
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Show
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Total toasts shown</p>
          <p data-testid="toast-counter" className="text-2xl font-bold text-indigo-600">{counter}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Currently visible</p>
          <p data-testid="toast-active-count" className="text-2xl font-bold text-gray-800">{toasts.length}</p>
        </div>
        <button
          data-testid="dismiss-all-button"
          onClick={dismissAll}
          disabled={toasts.length === 0}
          className="text-sm px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Dismiss All
        </button>
      </div>

      {/* Toast stack (fixed top-right) */}
      <div
        data-testid="toast-container"
        className="fixed top-6 right-6 flex flex-col gap-2 z-50"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </div>
  )
}
