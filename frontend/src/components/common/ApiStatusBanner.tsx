import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { getDataSource, subscribeDataSource } from '@/lib/dataSource'

export default function ApiStatusBanner() {
  const [source, setSource] = useState(getDataSource)

  useEffect(() => subscribeDataSource(() => setSource(getDataSource())), [])

  if (source !== 'mock') return null

  return (
    <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-medium">Showing demo data</p>
        <p className="text-amber-800/90">
          The backend API is unavailable or not ready yet. You can keep building and testing the UI
          with local demo data.
        </p>
      </div>
    </div>
  )
}