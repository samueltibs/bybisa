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
    { name: 'Sourcing & Pricing', href: '/shop?category=formula', image: 'https://quwajhihoxhqoexbghth.supabase.co/storage/v1/object/public/bybisa-previews/collections/sourcing-pricing.jpg' },
    { name: 'Start Here!!', href: '/shop?category=guide', image: 'https://quwajhihoxhqoexbghth.supabase.co/storage/v1/object/public/bybisa-previews/collections/start-here.jpg' },
  ]

  return (
    <div className="min-h-screen bg-[#F9F9F9]">

      {/* Hero â Dark full-width */}
      <section
        className="relative w-full min-h-[85vh] flex items-center justify-center text-white overflow-hidden"
        style={{
          backgroundImage: `url('https://quwajhihoxhqoexbghth.supabase.co/storage/v1/object/public/bybisa-previews/images/hero-background.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#121212]/70" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-[#C75B2B] font-semibold mb-4">By Bisa</p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Build Your Fashion Business With Clarity & Intention
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8">
            Digital tools, frameworks, and guides crafted for fashion entrepreneurs â from sourcing to scaling.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop">
              <Button size="lg" className="bg-[#C75B2B] hover:bg-[#a84a22] text-white px-8 rounded-full">
                Shop All Products <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/shop?category=bundle">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 rounded-full">
                View Bundles
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why ByBisa */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[#121212] mb-4">Why ByBisa?</h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            We built the tools we wish we had when starting our fashion brand.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Download className="h-6 w-6" />, title: 'Instant Download', desc: 'Get your files immediately after payment. No waiting, no shipping.' },
              { icon: <Shield className="h-6 w-6" />, title: '30-Day Guarantee', desc: 'Not satisfied? We will refund you â no questions asked within 30 days.' },
              { icon: <Zap className="h-6 w-6" />, title: 'Ready to Use', desc: 'Plug-and-play templates. Just open, customize, and go.' },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center p-6 rounded-2xl bg-[#F9F9F9]">
                <div className="w-12 h-12 rounded-full bg-[#C75B2B]/10 flex items-center justify-center text-[#C75B2B] mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-[#121212] mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-[#F9F9F9]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-[#121212]">Featured Products</h2>
            <Link to="/shop" className="text-[#C75B2B] font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : (
            <ProductGrid products={featured} />
          )}
        </div>
      </section>

      {/* Collections */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#121212] mb-10 text-center">Shop by Collection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {collections.map((col) => (
              <Link key={col.name} to={col.href} className="group relative overflow-hidden rounded-2xl h-64 block">
                <img
                  src={col.image}
                  alt={col.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-[#121212]/50 group-hover:bg-[#121212]/40 transition-colors" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-white text-xl font-bold">{col.name}</h3>
                  <p className="text-white/70 text-sm flex items-center gap-1 mt-1">
                    Shop now <ArrowRight className="h-3 w-3" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20 bg-[#121212] text-white">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#C75B2B] text-sm uppercase tracking-widest font-semibold mb-3">Our Story</p>
            <h2 className="text-3xl font-bold mb-6">Built by a Fashion Founder, for Fashion Founders</h2>
            <p className="text-white/70 leading-relaxed mb-6">
              ByBisa was born out of necessity. When building Bisa Styles, we spent hundreds of hours
              creating spreadsheets, frameworks, and systems from scratch. Now we package the best of
              those tools so you can skip the guesswork and focus on building your brand.
            </p>
            <Link to="/about">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 rounded-full">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="rounded-2xl overflow-hidden h-80">
            <img
              src="https://quwajhihoxhqoexbghth.supabase.co/storage/v1/object/public/bybisa-previews/images/brand-story.jpg"
              alt="Brand story"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[#121212] mb-12">What Founders Are Saying</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: 'The pricing formula literally saved my business. I had no idea I was underpricing by 40%.', name: 'Amara K.', role: 'Womenswear Founder' },
              { quote: 'I used the launch checklist for my pop-up and sold out in 3 hours. Worth every shilling.', name: 'Tendo M.', role: 'Streetwear Brand' },
              { quote: 'Finally, tools made for African fashion entrepreneurs. The supplier sheet is everything.', name: 'Zuri N.', role: 'Accessories Designer' },
            ].map((t) => (
              <div key={t.name} className="bg-[#F9F9F9] rounded-2xl p-6">
                <p className="text-gray-600 italic mb-4">"{t.quote}"</p>
                <p className="font-semibold text-[#121212]">{t.name}</p>
                <p className="text-gray-400 text-sm">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[#F9F9F9]">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-[#121212] mb-10">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-5 px-6 text-left"
                >
                  <span className="font-medium text-[#121212]">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-500 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#C75B2B]">
        <div className="max-w-3xl mx-auto px-6 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Your Business the Right Way?</h2>
          <p className="text-white/80 mb-8">
            Join hundreds of fashion entrepreneurs using ByBisa tools to price, source, and launch with confidence.
          </p>
          <Link to="/shop">
            <Button size="lg" className="bg-white text-[#C75B2B] hover:bg-white/90 px-10 rounded-full font-semibold">
              Browse All Products <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

    </div>
  )
}
