import { useState } from 'react'
import { Mail, Check, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function MailingListSignup() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'duplicate' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')

    const { error } = await supabase
      .from('mailing_list')
      .insert({ email: email.toLowerCase().trim(), name: name.trim() || null })

    if (error) {
      if (error.code === '23505') {
        setStatus('duplicate')
      } else {
        setStatus('error')
      }
      return
    }

    setStatus('success')
    setEmail('')
    setName('')
  }

  if (status === 'success') {
    return (
      <section className="bg-brand text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <Check className="w-10 h-10 mx-auto mb-3 text-green-400" />
          <h3 className="text-xl font-extrabold mb-2">You're in!</h3>
          <p className="text-white/60 text-sm">Watch your inbox for updates on new digital products and exclusive offers.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-brand text-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
        <Mail className="w-8 h-8 mx-auto mb-4 text-white/60" strokeWidth={1.5} />
        <h3 className="text-xl md:text-2xl font-extrabold mb-2">
          Join the ByBisa Community
        </h3>
        <p className="text-white/60 text-sm mb-6 max-w-md mx-auto">
          Get updates on new digital products, exclusive discounts, and business tips straight to your inbox.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Your email"
            required
            className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-6 py-3 bg-white text-brand rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-white/90 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {status === 'loading' ? 'Joining...' : 'Subscribe'}
          </button>
        </form>

        {status === 'duplicate' && (
          <p className="text-amber-300 text-xs mt-3 flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3" /> You're already subscribed!
          </p>
        )}
        {status === 'error' && (
          <p className="text-red-300 text-xs mt-3 flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3" /> Something went wrong. Please try again.
          </p>
        )}

        <p className="text-white/30 text-[10px] mt-4">No spam, ever. Unsubscribe anytime.</p>
      </div>
    </section>
  )
}
