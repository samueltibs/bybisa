import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-brand text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-6">
            BY BISA BRAND STORY
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            I Lost $2,000 on My First Supplier.
          </h1>
          <p className="text-xl md:text-2xl font-semibold mt-4 text-white/80">
            You Don't Have To.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="space-y-10">
          <div>
            <p className="text-lg text-text leading-relaxed">
              Hi, I'm <strong>Esther</strong>. I help entrepreneurs build profitable businesses
              through systems, not guesswork.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-4">
              The Beginning
            </h2>
            <p className="text-text-muted leading-relaxed">
              Five years ago, I sent $2,000 to what I thought was a legitimate supplier in China.
              The factory photos looked real. The samples were perfect. The pricing was competitive.
            </p>
            <p className="text-text-muted leading-relaxed mt-4">
              Three months later? No products. No responses. No refund.
              Just an expensive lesson in what NOT to do.
            </p>
            <p className="text-text-muted leading-relaxed mt-4">
              That mistake could have ended everything before it started. But instead of giving up, 
              I decided to figure this out â the right way.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-4">
              The Hard Lessons
            </h2>
            <p className="text-text-muted leading-relaxed mb-4">
              Over the next 5 years, I learned how to source from Turkey and China through trial, 
              error, and countless mistakes:
            </p>
            <ul className="space-y-3 text-text-muted">
              <li className="flex gap-3">
                <span className="text-accent font-bold">&rarr;</span>
                <span>I overpaid for middlemen pretending to be manufacturers</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">&rarr;</span>
                <span>I priced products too low and worked for free</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">&rarr;</span>
                <span>I ran 30% off sales that destroyed my margins</span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">&rarr;</span>
                <span>I learned the hard way that "cheap" always costs more in the end</span>
              </li>
            </ul>
            <p className="text-text-muted leading-relaxed mt-4">
              Every mistake taught me something. Every setback made me smarter. 
              Eventually, I developed systems that actually worked.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-4">
              The Turning Point
            </h2>
            <p className="text-text-muted leading-relaxed">
              Once I had real systems in place â for sourcing, for pricing, for quality control â 
              my business transformed. I went from losing money to consistently profitable. 
              From guessing to knowing. From chaos to clarity.
            </p>
            <p className="text-text-muted leading-relaxed mt-4">
              Other entrepreneurs started asking me: <em>"How do you find good suppliers?"</em> 
              <em>"How do you price your products?"</em> <em>"Where do I even start?"</em>
            </p>
            <p className="text-text-muted leading-relaxed mt-4">
              That's when I realized â the systems I built for myself could help others avoid 
              the same expensive mistakes.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted mb-4">
              Why Digital Tools?
            </h2>
            <p className="text-text-muted leading-relaxed mb-4">Because I believe in:</p>
            <ul className="space-y-3 text-text-muted">
              <li className="flex gap-3">
                <span className="text-accent font-bold">&rarr;</span>
                <span><strong className="text-text">Systems over guesswork</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">&rarr;</span>
                <span><strong className="text-text">Structure over chaos</strong></span>
              </li>
              <li className="flex gap-3">
                <span className="text-accent font-bold">&rarr;</span>
                <span><strong className="text-text">Profitable pricing over discounting yourself into a corner</strong></span>
              </li>
            </ul>
            <p className="text-text-muted leading-relaxed mt-4">
              Every product in the ByBisa store is something I wish I had when I started. 
              Built from real experience, tested in the real world, and designed to save you 
              time, money, and frustration.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
            Ready to Build With Intention?
          </h2>
          <p className="text-white/60 max-w-xl mx-auto mb-8">
            Skip the expensive lessons. Get the tools, templates, and frameworks 
            that took me 5 years to develop.
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
