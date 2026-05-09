import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, BarChart3, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import AdminDashboard from './AdminDashboard'
import AdminProducts from './AdminProducts'
import AdminOrders from './AdminOrders'
import AdminCoupons from './AdminCoupons'

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const location = useLocation()

  useEffect(() => {
    const saved = sessionStorage.getItem('bybisa-admin')
    if (saved === 'true') setAuthenticated(true)
  }, [])

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="bg-surface rounded-lg border border-border p-8 w-full max-w-sm">
          <h1 className="text-xl font-extrabold text-brand mb-6 text-center uppercase tracking-wider">
            Admin Access
          </h1>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && password === 'bybisa2026') {
                sessionStorage.setItem('bybisa-admin', 'true')
                setAuthenticated(true)
              }
            }}
            placeholder="Enter admin password"
            className="w-full px-4 py-3 rounded-lg border border-border bg-bg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          <button
            onClick={() => {
              if (password === 'bybisa2026') {
                sessionStorage.setItem('bybisa-admin', 'true')
                setAuthenticated(true)
              }
            }}
            className="w-full mt-4 px-4 py-3 bg-brand text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-brand-light transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/products', icon: Package, label: 'Products' },
    { href: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { href: '/admin/coupons', icon: Tag, label: 'Coupons' },
  ]

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside className="w-56 bg-brand text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6">
          <Link to="/admin" className="text-lg font-extrabold tracking-tight uppercase">
            BY BISA
          </Link>
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-colors',
                (item.href === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.href))
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon className="w-4 h-4" strokeWidth={1.5} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3">
          <button
            onClick={() => {
              sessionStorage.removeItem('bybisa-admin')
              setAuthenticated(false)
            }}
            className="flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-white/40 hover:text-white transition-colors w-full"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            SIGN OUT
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="*" element={<Navigate to="/admin" />} />
        </Routes>
      </main>
    </div>
  )
}
