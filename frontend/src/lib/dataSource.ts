type DataSource = 'unknown' | 'api' | 'mock'

let currentSource: DataSource = 'unknown'
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

export function markApiLive() {
  if (currentSource === 'api') return
  currentSource = 'api'
  notify()
}

export function markMockFallback() {
  if (currentSource === 'mock') return
  currentSource = 'mock'
  notify()
}

export function getDataSource() {
  return currentSource
}

export function subscribeDataSource(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}