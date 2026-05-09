import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-brand text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <span className="text-lg font-extrabold tracking-tight uppercase">BY BISA</span>
            <p className="text-sm text-white/60 mt-4 max-w-sm leading-relaxed">
              Digital tools, frameworks, and guides to help you build your fashion business 
              with clarity and intention.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-5">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { to: '/shop', label: 'Shop All' },
                { to: '/about', label: 'Our Story' },
                { to: '/my-purchases', label: 'My Purchases' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-white/70 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-5">Collections</h4>
            <ul className="space-y-3">
              {[
                { to: '/shop?category=template', label: 'Templates' },
                { to: '/shop?category=guide', label: 'Guides' },
                { to: '/shop?category=formula', label: 'Formulae' },
                { to: '/shop?category=bundle', label: 'Bundles' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-white/70 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Bisa Group LLC. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="mailto:bybisa@bisagroup.org" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              Contact
            </a>
            <a href="/about" className="text-xs text-white/40 hover:text-white/70 transition-colors">
              About
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
