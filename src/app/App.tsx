import { useState } from 'react'
import { DashboardPage } from '@/pages/DashboardPage'

export function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useState(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  })

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-indigo-400">Nexus</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full ${isOnline ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-4 py-6">
        <DashboardPage />
      </main>
    </div>
  )
}
