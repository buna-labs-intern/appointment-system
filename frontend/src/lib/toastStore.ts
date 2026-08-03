export type ToastTone = 'success' | 'error' | 'info'

export type ToastItem = {
  id: string
  message: string
  tone: ToastTone
}

let toasts: ToastItem[] = []
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

export function getToasts() {
  return toasts
}

export function subscribeToasts(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function pushToast(message: string, tone: ToastTone = 'success') {
  const id = crypto.randomUUID()
  toasts = [...toasts, { id, message, tone }]
  notify()

  window.setTimeout(() => {
    dismissToast(id)
  }, 2800)

  return id
}

export function dismissToast(id: string) {
  toasts = toasts.filter((toast) => toast.id !== id)
  notify()
}

export const toast = {
  success: (message: string) => pushToast(message, 'success'),
  error: (message: string) => pushToast(message, 'error'),
  info: (message: string) => pushToast(message, 'info'),
}