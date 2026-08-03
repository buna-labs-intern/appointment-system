import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import {
  dismissToast,
  getToasts,
  subscribeToasts,
  type ToastItem,
} from '@/lib/toastStore'

const toneStyles: Record<ToastItem['tone'], string> = {
  success: 'border-[#0F5C66]/30 bg-[#E7F4F4] text-[#0F5C66]',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  info: 'border-border bg-white text-foreground',
}

export default function ToastHost() {
  const [items, setItems] = useState(getToasts)

  useEffect(() => {
    const unsubscribe = subscribeToasts(() => setItems(getToasts()))
    return () => {
      unsubscribe()
    }
  }, [])

  if (items.length === 0) return null

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${toneStyles[item.tone]}`}
        >
          <p className="min-w-0 flex-1 font-medium">{item.message}</p>
          <button
            type="button"
            onClick={() => dismissToast(item.id)}
            className="rounded-md p-1 opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}