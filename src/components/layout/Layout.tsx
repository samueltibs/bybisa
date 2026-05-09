import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

function BisaStylesBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-[#121212] text-white text-xs py-2 px-4 flex items-center justify-center gap-3 relative">
      <span className="flex items-center gap-2">
        <span>👗</span>
        <span className="text-white/70">Shop African fashion at</span>
        <a
          href="https://bisastyles.store"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-white hover:text-[#C75B2B] transition-colors"
        >
          BisaStyles.store →
        </a>
      </span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors leading-none"
      >
        ✕
      </button>
    </div>
  )
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-warm-bg">
      <Header />
      <BisaStylesBanner />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
