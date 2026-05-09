import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { cn } from '@/lib/utils'

const LOGO_URL = 'https://quwajhihoxhqoexbghth.supabase.co/storage/v1/object/public/bybisa-previews/logos/by_bisa_logo.png'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { items } = useCart()
  const location = useLocation()
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/about', label: 'About' },
    { href: '/my-purchases', label: 'My Purchases' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 bg-[#121212] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm-px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src={LOGO_URL}
              alt="By Bisa"
              className="h-8 w-auto object-contain"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement
                target.style.display = 'none'
                const fallback = target.nextSibling as HTMLElement
                if (fallback) fallback.style.display = 'block'
              }}
            />
            <span
              style={{ display: 'none' }}
              className="text-white font-bold text-xl tracking-widest uppercase"
            >
              BY BISA
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'text-[#C75B2B]'
                    : 'text-white/hover:text-[#C75B2B]'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side: Cart + Mobile menu */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-white hover:text-[#C75B2B] transition-colors"
            >
              <ShoppingCart className="h-size w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C75B2B] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-white hover:text-[#C75B2B] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-size w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-[#121212] border-t-[1px] border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'block py-2 text-sm font-medium transition-colors',
                  isActive(link.href)
                    ? 'text-[#C75B2B]'
                    : 'text-white hover:text-[#C75B2B]'
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
