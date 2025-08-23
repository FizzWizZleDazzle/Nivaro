import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

let toastListener: ((toast: Toast) => void) | null = null

export const toast = {
  success: (message: string) => {
    const newToast: Toast = {
      id: Date.now().toString(),
      message,
      type: 'success'
    }
    toastListener?.(newToast)
  },
  error: (message: string) => {
    const newToast: Toast = {
      id: Date.now().toString(),
      message,
      type: 'error'
    }
    toastListener?.(newToast)
  },
  info: (message: string) => {
    const newToast: Toast = {
      id: Date.now().toString(),
      message,
      type: 'info'
    }
    toastListener?.(newToast)
  }
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    toastListener = (toast: Toast) => {
      setToasts(prev => [...prev, toast])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      }, 5000)
    }

    return () => {
      toastListener = null
    }
  }, [])

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white'
      case 'error':
        return 'bg-red-500 text-white'
      case 'info':
        return 'bg-blue-500 text-white'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${getToastStyles(toast.type)} px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[300px] animate-slide-in`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-4 hover:opacity-80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}