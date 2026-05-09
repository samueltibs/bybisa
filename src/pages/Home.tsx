import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Download, Shield, Zap, RefreshCw, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Product } from '@/types'
import ProductGrid from '@/components/products/ProductGrid'
import Button from '@/components/ui/Button'

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    loadFeatured()
  }, [])

  async function loadFeatured() {
    const { data } = await supabase
      .from('bybisa_products')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('sort_order', { ascending: true })
      .limit(6)
    setFeatured(data || [])
    setLoading(false)
  }

  const faqs = [
    { q: 'What format are the digital products in?', a: 'Our products come in PDF, Excel (.xlsx), and PowerPoint formats depending on the product. All formats are clearly listed on each product page.' },
    { q: 'How do I access my purchase?', a: 'Immediately after payment, you will receive a download link on screen and via email. You can download your files up to 5 times.' },
    { q: 'Can I get a refund?', a: 'Yes! We offer a 30-day money-back guarantee. If you are not satisfied, contact us at bybisa@bisagroup.org.' },
    { q: 'Are these products for beginners?', a: 'Absolutely. Our tools are designed for entrepreneurs at every stage â especially those just starting out who want to avoid costly mistakes.' },
    { q: 'Do you offer bundles?', a: 'Yes! Check our Bundles collection to save on multiple products purchased together.' },
  ]

  const collections = [
    { name: 'Sourcing & Pricing', href: '/shop?category=formula', image: 'https://www.bybisa.com/cdn/shop/collections/imageeeeee.png?v=1767883540&width=800' },
    { name: 'Start Here!!', href: '/shop?category=guide', image: 'https://www.bybisa.com/cdn/shop/collections/checklist.png?v=1767960395&width=800' },
  ]

  return (
    <div>
      {/* Hero â Dark full-width like bybisa.com */}
      <section className="relative bg-brand text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://www.bybisa.com/cdn/shop/files/COVERRRRRRR_LANDING.png?v=1767952742&width=3840" 
            alt="" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36 text-center">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            Build Your Fashion Business With Clarity & Intention
          </h1>
          <p className="mt-6 text-base md:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Digital tools, frameworks, and guides created to help you move from idea 
            to execution â without confusion or overwhelm.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Link to="/shop">
              <Button variant="secondary" size="lg" className="bg-white text-brand hover:bg-white/90 border-0">
                Shop Digital Products
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:text-white">
                Learn About By Bisa
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Shop by Collection */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-8">
          Shop by collection
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collections.map(col => (
            <Link key={col.name} to={col.href} className="group relative aspect-[16/9] rounded-lg overflow-hidden bg-border-light">
              <img src={col.image} alt={col.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-white font-bold text-lg">{col.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Brand Story â matching bybisa.com's layout */}
      <section className="bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://www.bybisa.com/cdn/shop/files/mmm.png?v=1770303139&width=1200" 
                alt="By Bisa Brand Story" 
                className="rounded-lg w-full"
              />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-4">
                BY BISA BRAND STORY
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-brand leading-tight">
                I Lost <span className="text-accent">$2,000</span> on My First Supplier.
              </h2>
              <p className="text-xl font-semibold text-brand mt-2 mb-6">You Don't Have To.</p>
              <p className="text-text-muted leading-relaxed mb-4">
                Hi, I'm Esther. I help entrepreneurs build profitable businesses through systems, not guesswork.
              </p>
              <p className="text-text-muted leading-relaxed mb-6">
                Five years ago, I sent $2,000 to what I thought was a legitimate supplier in China. 
                Three months later? No products. No responses. No refund. That mistake could have 
                ended everything â but instead, I decided to figure this out the right way.
              </p>
              <Link to="/about">
                <Button>
                  Read The Full Story <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What I Built! â Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand">What I Built!</h2>
          <p className="text-text-muted mt-3 max-w-xl mx-auto">
            Every tool, template, and framework was born from real experience â not theory.
          </p>
        </div>
        <ProductGrid products={featured} loading={loading} />
        <div className="text-center mt-10">
          <Link to="/shop">
            <Button variant="outline">
              View All Products <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Why Digital Tools â matching bybisa.com */}
      <section className="bg-brand text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-4">
            WHY DIGITAL TOOLS?
          </h2>
          <p className="text-xl md:text-2xl font-semibold leading-relaxed mb-10">
            Because I believe in systems over guesswork, structure over chaos, 
            and profitable pricing over discounting yourself into a corner.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Download, label: 'Instant Download' },
              { icon: Shield, label: 'Secure Payment' },
              { icon: Zap, label: 'Lifetime Access' },
              { icon: RefreshCw, label: '30-Day Guarantee' },
            ].map(item => (
              <div key={item.label} className="text-center">
                <item.icon className="w-6 h-6 mx-auto mb-2 text-white/70" strokeWidth={1.5} />
                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-0 divide-y divide-border">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left"
              >
                <span className="font-semibold text-brand text-sm pr-4">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-text-muted flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <p className="text-sm text-text-muted pb-5 leading-relaxed">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-20">
        <div className="bg-brand rounded-lg p-10 md:p-16 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
            Ready to Build Your Business the Right Way?
          </h2>
          <p className="text-white/60 max-w-xl mx-auto mb-8">
            Get instant access to proven tools and frameworks that have helped entrepreneurs 
            avoid costly mistakes and build profitable fashion businesses.
          </p>
          <Link to="/shop">
            <Button variant="secondary" size="lg" className="bg-white text-brand hover:bg-white/90 border-0">
              Explore Digital Products <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
