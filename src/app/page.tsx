'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  ArrowRight,
  Sparkles,
  Zap,
  Heart,
  Users,
  Calendar,
  Mail,
  FileText,
  MessageSquare,
  CheckCircle2,
  Clock,
  TrendingUp,
  Star,
  Quote,
  Menu,
  X,
  Play,
  ChevronRight,
} from 'lucide-react'

// ====================================================================
//  DATA
// ====================================================================

const SERVICES = [
  {
    icon: Users,
    name: 'The Coordinator',
    origin: 'Originally: The Orchestrator',
    desc: 'Nothing falls through the cracks. Every task picked up by the right crew member, every time.',
    accent: 'peach',
  },
  {
    icon: Heart,
    name: 'People Memory',
    origin: 'Originally: Pule',
    desc: 'We remember your customers, suppliers, and team — so you never explain a relationship twice.',
    accent: 'purple',
  },
  {
    icon: FileText,
    name: 'Knowledge at Hand',
    origin: 'Originally: Albert',
    desc: 'Documents, meetings, and notes become a searchable library the whole crew can draw on.',
    accent: 'purple',
  },
  {
    icon: Zap,
    name: 'Always-On Crew',
    origin: 'Originally: Always-on Services',
    desc: 'Background helpers keep working when you are not. Scheduled tasks, monitoring, follow-ups.',
    accent: 'peach',
  },
  {
    icon: Calendar,
    name: 'Tool Connections',
    origin: 'Originally: Tool Integrations',
    desc: 'We plug into the apps you already use — email, calendar, tasks, messaging, content.',
    accent: 'purple',
  },
  {
    icon: Sparkles,
    name: 'The Dashboard',
    origin: 'Originally: Operator Dashboard',
    desc: 'One calm screen for what is done, what is in progress, and what needs your eyes.',
    accent: 'peach',
  },
  {
    icon: CheckCircle2,
    name: 'Sign-Off Loop',
    origin: 'Originally: Review Workflows',
    desc: 'Nothing important ships without your say-so. Your crew checks its work and waits for your nod.',
    accent: 'purple',
  },
  {
    icon: Mail,
    name: 'Crew Members',
    origin: 'Originally: Agent Personas',
    desc: 'Specialist teammates, each with a role — scheduling, follow-ups, research, bookkeeping.',
    accent: 'peach',
  },
] as const

const STATS = [
  { value: 3238, label: 'Human hours reclaimed', suffix: '' },
  { value: 9794, label: 'Work items completed', suffix: '' },
  { value: 120, label: 'Reusable skills', suffix: '+' },
  { value: 27, label: 'Tool integrations', suffix: '' },
]

const PALETTE = [
  { hex: '#FAE3E3', name: 'Pale Blush', role: 'Background', text: '#2D1B2E' },
  { hex: '#FFBEBF', name: 'Saturated Blush', role: 'Card fills', text: '#2D1B2E' },
  { hex: '#FF7E5D', name: 'Secondary Peach', role: 'Soft fills', text: '#2D1B2E' },
  { hex: '#F33167', name: 'Primary Peach', role: 'Highlight', text: '#FFFFFF' },
  { hex: '#8954AB', name: 'Primary Purple', role: 'Accent', text: '#FFFFFF' },
  { hex: '#B464AD', name: 'Secondary Purple', role: 'Depth', text: '#FFFFFF' },
  { hex: '#2D1B2E', name: 'Warm Plum Charcoal', role: 'Text', text: '#FAE3E3' },
]

const CREW = [
  { name: 'Maya', role: 'Reviews & Replies', color: '#F33167', status: 'drafting' },
  { name: 'Theo', role: 'Scheduling', color: '#8954AB', status: 'checking' },
  { name: 'Lena', role: 'Bookkeeping', color: '#B464AD', status: 'reconciling' },
  { name: 'Owen', role: 'Research', color: '#FF7E5D', status: 'reading' },
] as const

const CREW_ACTIVITIES = [
  'drafted a reply to a 3-star review on Google',
  'queued tomorrow morning\'s invoice batch',
  'flagged a scheduling conflict at 2pm Thursday',
  'pulled last quarter\'s revenue summary',
  'sent a follow-up to the new lead from Instagram',
  'booked the recurring Monday team sync',
  'cleaned up 14 duplicate contacts in your list',
  'drafted this week\'s customer newsletter',
  'caught a typo in the contract before it sent',
  'reminded you about the expiring domain renewal',
]

const TESTIMONIALS = [
  {
    quote:
      'My mornings used to start with dread — 30 unread emails, three forgotten follow-ups. Now I wake up and Maya has already drafted the replies. I just say yes or no.',
    name: 'Priya Shah',
    role: 'Founder, Sunday Bloom Florals',
    avatar: 'P',
    color: '#F33167',
  },
  {
    quote:
      'I run a two-person coffee roastery. We don\'t have a marketing team. Hearthwork is our marketing team. It posts, it replies, it follows up — I just taste the coffee.',
    name: 'Marcus Reyes',
    role: 'Co-owner, Northbound Roasters',
    avatar: 'M',
    color: '#8954AB',
  },
  {
    quote:
      'I was skeptical. Every "AI assistant" I tried before felt like a chatbot pretending to be a person. This is the first one that feels like a coworker who actually gets it.',
    name: 'Téa Levesque',
    role: 'Solo consultant, Levesque Strategy',
    avatar: 'T',
    color: '#FF7E5D',
  },
  {
    quote:
      'I hired Hearthwork to do admin. Six weeks later it is doing customer research, draft proposals, and weekly retrospectives. I did not ask for any of that. It just kept showing up.',
    name: 'Jordan Okafor',
    role: 'Founder, Loop Studio',
    avatar: 'J',
    color: '#B464AD',
  },
]

const PRICING = [
  {
    name: 'Solo',
    price: '$0',
    cadence: 'free forever',
    blurb: 'For freelancers and side hustles just getting started.',
    features: ['2 crew members', '3 tool connections', 'Daily digests', 'Email support'],
    cta: 'Start free',
    featured: false,
  },
  {
    name: 'Crew',
    price: '$49',
    cadence: 'per month',
    blurb: 'For small business owners running daily operations.',
    features: [
      '8 crew members',
      'Unlimited tool connections',
      'Always-on services',
      'Sign-off workflow',
      'Knowledge library',
      'Priority support',
    ],
    cta: 'Start 14-day trial',
    featured: true,
  },
  {
    name: 'Studio',
    price: 'Custom',
    cadence: 'talk to us',
    blurb: 'For teams and multi-location businesses.',
    features: [
      'Unlimited crew members',
      'Custom skills & playbooks',
      'SSO + audit logs',
      'Dedicated success manager',
      'Onboarding workshop',
    ],
    cta: 'Book a call',
    featured: false,
  },
]

// ====================================================================
//  SMALL HELPERS
// ====================================================================

function useCountUp(target: number, duration = 1500, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, start])
  return value
}

// ====================================================================
//  STICKY NAV
// ====================================================================

function StickyNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navItems = [
    { label: 'Services', href: '#services' },
    { label: 'Palette', href: '#palette' },
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'Founders', href: '#founders' },
    { label: 'Pricing', href: '#pricing' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-blush/85 backdrop-blur-xl border-b border-blush-line shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex items-center justify-between h-16">
        <a href="#top" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-1 to-peach-1 flex items-center justify-center group-hover:scale-110 transition-transform">
            <div className="w-3 h-3 rounded-full bg-white" />
          </div>
          <span className="font-display text-xl font-medium text-plum tracking-tight">
            Hearthwork
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-3 py-2 text-sm font-medium text-muted-plum hover:text-purple-1 transition-colors rounded-md hover:bg-white/40"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#pricing"
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-purple-1 hover:bg-purple-2 rounded-full transition-all hover:shadow-lg hover:shadow-purple-1/30"
          >
            Start free
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </a>
          <button
            className="md:hidden p-2 text-plum"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-blush/95 backdrop-blur-xl border-b border-blush-line"
          >
            <div className="px-6 py-3 flex flex-col">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-2 text-sm font-medium text-plum"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

// ====================================================================
//  HERO
// ====================================================================

const ROTATING_PHRASES = [
  'follow-ups',
  'scheduling',
  'replies',
  'busywork',
  'invoicing',
  'research',
  'newsletters',
]

function Hero() {
  const [phraseIdx, setPhraseIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % ROTATING_PHRASES.length)
    }, 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <section
      id="top"
      className="relative min-h-screen bg-animated-gradient overflow-hidden flex items-center pt-20 pb-16"
    >
      {/* Floating decorative shapes */}
      <div className="absolute top-32 left-[8%] w-24 h-24 rounded-full bg-peach-1/30 animate-floaty blur-sm" />
      <div className="absolute top-48 right-[12%] w-32 h-32 rounded-full bg-purple-1/25 animate-floaty-slow blur-sm" />
      <div className="absolute bottom-32 left-[15%] w-20 h-20 rounded-full bg-purple-2/30 animate-floaty blur-sm" />
      <div className="absolute bottom-48 right-[8%] w-16 h-16 rounded-full bg-peach-2/40 animate-floaty-slow" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 grid lg:grid-cols-12 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-7 text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-white/60 backdrop-blur-sm border border-white/80 text-xs font-semibold text-purple-1 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-peach-1 animate-pulse" />
            IN BETA · JOIN 200+ FOUNDERS
          </div>

          <h1 className="font-display font-normal text-5xl sm:text-6xl lg:text-7xl leading-[1.0] tracking-tight text-plum">
            Your crew handles the <span className="text-gradient-peach italic font-light">busywork.</span>
            <br />
            <span className="text-plum">You do the </span>
            <span className="relative inline-block">
              <AnimatePresence mode="wait">
                <motion.span
                  key={phraseIdx}
                  initial={{ y: 30, opacity: 0, rotateX: -90 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  exit={{ y: -30, opacity: 0, rotateX: 90 }}
                  transition={{ duration: 0.45 }}
                  className="inline-block text-gradient italic font-light"
                >
                  {ROTATING_PHRASES[phraseIdx]}
                </motion.span>
              </AnimatePresence>
            </span>
            .
          </h1>

          <p className="mt-7 text-lg lg:text-xl text-muted-plum max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Hearthwork is your always-on crew for the work you hate doing. Friendly, warm, and quietly competent — never a robot, never a chatbot, never another login to remember.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <a
              href="#pricing"
              className="inline-flex items-center justify-center px-7 py-3.5 bg-peach-1 hover:bg-peach-1/90 text-white font-semibold rounded-full transition-all hover:shadow-xl hover:shadow-peach-1/30 hover:-translate-y-0.5 animate-pulse-glow"
            >
              Start free
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
            <a
              href="#dashboard"
              className="inline-flex items-center justify-center px-7 py-3.5 bg-white/70 backdrop-blur-sm hover:bg-white text-plum font-semibold rounded-full transition-all border border-white/80 hover:shadow-lg"
            >
              <Play className="w-4 h-4 mr-2" />
              See it in action
            </a>
          </div>

          <p className="mt-5 text-xs text-muted-plum font-medium tracking-wide">
            No credit card · Free forever plan · Cancel anytime
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="lg:col-span-5 relative"
        >
          <HeroCard />
        </motion.div>
      </div>
    </section>
  )
}

function HeroCard() {
  return (
    <div className="relative">
      {/* Main card */}
      <div className="relative bg-white rounded-3xl shadow-2xl shadow-purple-1/15 p-6 border border-white">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-xs font-semibold text-muted-plum tracking-wider uppercase">
              Tuesday morning
            </div>
            <div className="font-display text-lg text-plum">Good morning, Priya.</div>
          </div>
          <div className="flex -space-x-2">
            {CREW.slice(0, 4).map((c) => (
              <div
                key={c.name}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                style={{ backgroundColor: c.color }}
              >
                {c.name[0]}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          {[
            { text: 'Maya drafted 3 review replies', icon: '✓', color: '#F33167' },
            { text: 'Theo queued 5 invoices for Tuesday', icon: '✓', color: '#8954AB' },
            { text: 'Lena reconciled last week\'s books', icon: '✓', color: '#B464AD' },
            { text: 'Owen flagged 1 scheduling conflict', icon: '!', color: '#FF7E5D' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.15 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-blush"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: item.color }}
              >
                {item.icon}
              </div>
              <div className="text-sm text-plum font-medium">{item.text}</div>
            </motion.div>
          ))}
        </div>

        <div className="mt-5 pt-5 border-t border-blush-line">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-plum font-medium">One thing needs your eyes:</span>
            <span className="text-peach-1 font-semibold">1 sign-off</span>
          </div>
          <div className="mt-2 p-3 rounded-xl bg-peach-1/10 border border-peach-1/30">
            <div className="text-sm font-semibold text-plum">Reply to Marcus re: wholesale order</div>
            <div className="text-xs text-muted-plum mt-0.5">Drafted by Maya · 2 min ago</div>
          </div>
        </div>
      </div>

      {/* Floating accent badge */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute -top-5 -right-3 bg-peach-1 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
      >
        ✦ 4 things done
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute -bottom-4 -left-3 bg-purple-1 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
      >
        while you slept
      </motion.div>
    </div>
  )
}

// ====================================================================
//  STATS
// ====================================================================

function StatsBar() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section className="py-16 bg-white/40 border-y border-blush-line">
      <div ref={ref} className="mx-auto max-w-7xl px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {STATS.map((stat, i) => (
          <StatItem key={i} stat={stat} start={inView} />
        ))}
      </div>
    </section>
  )
}

function StatItem({ stat, start }: { stat: typeof STATS[number]; start: boolean }) {
  const value = useCountUp(stat.value, 1800, start)
  return (
    <div className="text-center">
      <div className="font-display text-4xl lg:text-5xl font-medium text-gradient">
        {value.toLocaleString()}
        {stat.suffix}
      </div>
      <div className="mt-2 text-xs lg:text-sm text-muted-plum font-medium tracking-wide uppercase">
        {stat.label}
      </div>
    </div>
  )
}

// ====================================================================
//  SERVICES
// ====================================================================

function ServicesSection() {
  return (
    <section id="services" className="py-24 relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader
          tag="What we do"
          title={
            <>
              Eight ways we make the day{' '}
              <span className="italic font-light text-gradient">easier</span> — without ever
              feeling like software.
            </>
          }
          subtitle="Pick the ones your business needs today; the rest are there when you grow into them. No jargon, no dashboards to learn, no new login to remember."
        />

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map((service, i) => (
            <ServiceCard key={i} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceCard({ service, index }: { service: typeof SERVICES[number]; index: number }) {
  const [hovered, setHovered] = useState(false)
  const Icon = service.icon
  const isPurple = service.accent === 'purple'
  const accentColor = isPurple ? '#8954AB' : '#F33167'
  const bgTint = isPurple ? 'rgba(137, 84, 171, 0.08)' : 'rgba(243, 49, 103, 0.08)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative bg-white rounded-2xl p-6 border border-blush-line transition-all duration-300 hover:shadow-xl hover:shadow-purple-1/10 hover:-translate-y-1 cursor-pointer overflow-hidden"
      style={{ borderColor: hovered ? accentColor : '#F0D0D0' }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: bgTint }}
      />

      <div className="relative">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3"
          style={{ backgroundColor: accentColor }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>

        <h3 className="font-display text-xl font-medium text-plum mb-1">{service.name}</h3>
        <p className="text-[10px] font-semibold text-muted-plum tracking-wider uppercase mb-3">
          {service.origin}
        </p>
        <p className="text-sm text-plum/80 leading-relaxed">{service.desc}</p>

        <div
          className="mt-4 inline-flex items-center text-xs font-semibold transition-all group-hover:gap-2 gap-1"
          style={{ color: accentColor }}
        >
          Learn more <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </motion.div>
  )
}

// ====================================================================
//  SECTION HEADER (shared)
// ====================================================================

function SectionHeader({
  tag,
  title,
  subtitle,
}: {
  tag: string
  title: React.ReactNode
  subtitle?: string
}) {
  return (
    <div className="max-w-3xl">
      <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-1 tracking-[0.2em] uppercase mb-4">
        <div className="w-6 h-px bg-purple-1" />
        {tag}
      </div>
      <h2 className="font-display text-4xl lg:text-5xl font-normal text-plum leading-[1.05] tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-lg text-muted-plum leading-relaxed">{subtitle}</p>
      )}
    </div>
  )
}

// ====================================================================
//  PALETTE EXPLORER
// ====================================================================

function PaletteSection() {
  const [selected, setSelected] = useState(0)
  const current = PALETTE[selected]

  return (
    <section id="palette" className="py-24 bg-white/40 border-y border-blush-line">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader
          tag="The brand"
          title={
            <>
              A palette built for{' '}
              <span className="italic font-light text-gradient-peach">warmth</span>, not for
              corporate dashboards.
            </>
          }
          subtitle="Click any swatch to see it applied. We picked purple for sophistication, peach for warmth, and a soft blush for the background. No blue. No gray. No cold."
        />

        <div className="mt-14 grid lg:grid-cols-12 gap-8">
          {/* Swatch picker */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-3">
              {PALETTE.map((color, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`relative rounded-2xl p-4 text-left transition-all duration-300 hover:scale-[1.02] ${
                    selected === i
                      ? 'ring-2 ring-offset-2 ring-offset-blush scale-[1.02]'
                      : 'ring-1 ring-blush-line'
                  }`}
                  style={{
                    backgroundColor: color.hex,
                    color: color.text,
                    // @ts-expect-error — CSS var for ring color
                    '--tw-ring-color': color.hex,
                  }}
                >
                  <div className="text-sm font-bold">{color.name}</div>
                  <div className="text-xs opacity-70 mt-0.5 font-mono">{color.hex}</div>
                  <div className="text-[10px] opacity-60 mt-2 uppercase tracking-wider font-semibold">
                    {color.role}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Live preview */}
          <div className="lg:col-span-7">
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-3xl overflow-hidden shadow-2xl"
              style={{ backgroundColor: current.hex, color: current.text }}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-70">
                    Live preview · {current.name}
                  </div>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full opacity-40" style={{ backgroundColor: current.text }} />
                    <div className="w-2.5 h-2.5 rounded-full opacity-40" style={{ backgroundColor: current.text }} />
                    <div className="w-2.5 h-2.5 rounded-full opacity-40" style={{ backgroundColor: current.text }} />
                  </div>
                </div>

                <h3 className="font-display text-4xl font-normal leading-tight mb-3">
                  The warmth behind your work.
                </h3>
                <p className="text-sm opacity-80 leading-relaxed mb-6 max-w-md">
                  This is how the brand looks when <strong>{current.name}</strong> takes the
                  lead. Try clicking other swatches to see the whole palette in action.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span
                    className="px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: current.text,
                      color: current.hex,
                    }}
                  >
                    Primary button
                  </span>
                  <span
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border-2"
                    style={{ borderColor: current.text, color: current.text }}
                  >
                    Secondary
                  </span>
                </div>

                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: current.text,
                    color: current.hex,
                  }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">
                    Maya · Reviews & Replies
                  </div>
                  <div className="text-sm">
                    Drafted a reply to a 3-star review on Google. Want to see it?
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ====================================================================
//  CREW DASHBOARD (interactive, simulated)
// ====================================================================

function DashboardSection() {
  const [activities, setActivities] = useState<
    { id: number; crew: typeof CREW[number]; text: string; time: string }[]
  >([
    { id: 1, crew: CREW[0], text: CREW_ACTIVITIES[0], time: 'just now' },
    { id: 2, crew: CREW[1], text: CREW_ACTIVITIES[1], time: '2 min ago' },
    { id: 3, crew: CREW[2], text: CREW_ACTIVITIES[2], time: '5 min ago' },
    { id: 4, crew: CREW[3], text: CREW_ACTIVITIES[3], time: '8 min ago' },
  ])
  const nextId = useRef(5)

  useEffect(() => {
    const t = setInterval(() => {
      const crew = CREW[Math.floor(Math.random() * CREW.length)]
      const text = CREW_ACTIVITIES[Math.floor(Math.random() * CREW_ACTIVITIES.length)]
      setActivities((prev) =>
        [
          { id: nextId.current++, crew, text, time: 'just now' },
          ...prev.slice(0, 3).map((a) => ({ ...a, time: 'just now' })),
        ].slice(0, 4)
      )
    }, 3500)
    return () => clearInterval(t)
  }, [])

  return (
    <section id="dashboard" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader
          tag="The dashboard"
          title={
            <>
              One calm screen.{' '}
              <span className="italic font-light text-gradient">Everything that matters.</span>
            </>
          }
          subtitle="No noise, no fifty tabs. Your crew reports in, you sign off, you go back to the work you actually love. This is a live feed — watch it for a few seconds."
        />

        <div className="mt-14 grid lg:grid-cols-12 gap-6">
          {/* Live activity feed */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl shadow-xl shadow-purple-1/10 border border-blush-line overflow-hidden">
              <div className="px-6 py-4 border-b border-blush-line flex items-center justify-between bg-blush-sat/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-peach-1 animate-pulse" />
                  <span className="font-display text-lg text-plum">Live activity</span>
                </div>
                <span className="text-xs text-muted-plum font-semibold">Updated every few seconds</span>
              </div>

              <div className="p-4 space-y-2 min-h-[360px]">
                <AnimatePresence mode="popLayout">
                  {activities.map((activity) => (
                    <motion.div
                      key={activity.id}
                      layout
                      initial={{ opacity: 0, y: -10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-blush/50 transition-colors"
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: activity.crew.color }}
                      >
                        {activity.crew.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-plum">
                          <span className="font-semibold">{activity.crew.name}</span>{' '}
                          <span className="text-muted-plum">{activity.text}</span>
                        </div>
                        <div className="text-xs text-muted-plum mt-0.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-purple-1 flex-shrink-0 mt-1" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Side panels */}
          <div className="lg:col-span-5 space-y-6">
            {/* Crew roster */}
            <div className="bg-white rounded-3xl shadow-xl shadow-purple-1/10 border border-blush-line p-6">
              <h3 className="font-display text-lg text-plum mb-4">Your crew</h3>
              <div className="space-y-3">
                {CREW.map((member) => (
                  <div key={member.name} className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-plum">{member.name}</div>
                      <div className="text-xs text-muted-plum">{member.role}</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-purple-1 font-semibold">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-1 animate-pulse" />
                      {member.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Today summary */}
            <div className="bg-gradient-to-br from-purple-1 to-purple-2 rounded-3xl shadow-xl shadow-purple-1/20 p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5" />
                <span className="text-xs font-bold tracking-wider uppercase opacity-80">
                  Today
                </span>
              </div>
              <div className="font-display text-3xl font-medium">14 things done</div>
              <div className="text-sm opacity-80 mt-1">3 hours reclaimed · 1 sign-off waiting</div>

              <div className="mt-5 pt-5 border-t border-white/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="opacity-80">This week</span>
                  <span className="font-bold">+38% reclaimed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ====================================================================
//  TESTIMONIALS
// ====================================================================

function TestimonialsSection() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % TESTIMONIALS.length), 6000)
    return () => clearInterval(t)
  }, [])

  const current = TESTIMONIALS[idx]

  return (
    <section id="founders" className="py-24 bg-white/40 border-y border-blush-line">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <SectionHeader
          tag="Founder voices"
          title={
            <>
              Young founders, <span className="italic font-light text-gradient-peach">real stories.</span>
            </>
          }
          subtitle="These are not made-up personas. They are the kinds of people who use Hearthwork every day — and what they actually say about it."
        />

        <div className="mt-14 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl shadow-xl shadow-purple-1/10 border border-blush-line p-8 lg:p-12"
            >
              <Quote className="w-10 h-10 text-peach-1 mb-4" />
              <p className="font-display text-2xl lg:text-3xl font-light text-plum leading-relaxed mb-8 italic">
                &ldquo;{current.quote}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: current.color }}
                >
                  {current.avatar}
                </div>
                <div>
                  <div className="font-semibold text-plum">{current.name}</div>
                  <div className="text-sm text-muted-plum">{current.role}</div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-peach-1 fill-peach-1" />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex justify-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-2 rounded-full transition-all ${
                  i === idx ? 'w-8 bg-peach-1' : 'w-2 bg-blush-sat hover:bg-peach-1/50'
                }`}
                aria-label={`Testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ====================================================================
//  PRICING
// ====================================================================

function PricingSection() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader
          tag="Pricing"
          title={
            <>
              Free to start. <span className="italic font-light text-gradient">Honest</span> when you grow.
            </>
          }
          subtitle="No setup fees, no long contracts, no surprise overages. Start free, upgrade when your crew is earning its keep. Cancel anytime."
        />

        <div className="mt-14 grid md:grid-cols-3 gap-6 items-stretch">
          {PRICING.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 flex flex-col ${
                tier.featured
                  ? 'bg-gradient-to-br from-purple-1 to-purple-2 text-white shadow-2xl shadow-purple-1/25 md:-translate-y-4 lg:scale-105'
                  : 'bg-white border border-blush-line text-plum'
              }`}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-peach-1 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most popular
                </div>
              )}

              <div className="font-display text-2xl font-medium mb-2">{tier.name}</div>
              <p className={`text-sm mb-6 ${tier.featured ? 'opacity-80' : 'text-muted-plum'}`}>
                {tier.blurb}
              </p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="font-display text-5xl font-medium">{tier.price}</span>
                <span className={`text-sm ${tier.featured ? 'opacity-70' : 'text-muted-plum'}`}>
                  {tier.cadence}
                </span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <CheckCircle2
                      className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        tier.featured ? 'text-peach-2' : 'text-purple-1'
                      }`}
                    />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#top"
                className={`inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                  tier.featured
                    ? 'bg-peach-1 text-white hover:bg-peach-1/90'
                    : 'bg-blush text-plum hover:bg-blush-sat'
                }`}
              >
                {tier.cta}
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ====================================================================
//  FINAL CTA
// ====================================================================

function FinalCTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-purple-1 via-purple-2 to-peach-1 rounded-[2.5rem] p-12 lg:p-16 text-center overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute top-10 right-10 w-3 h-3 rounded-full bg-peach-2 animate-pulse" />
          <div className="absolute bottom-10 left-10 w-2 h-2 rounded-full bg-white animate-pulse" />

          <div className="relative">
            <h2 className="font-display text-4xl lg:text-6xl font-normal text-white leading-[1.05] tracking-tight">
              Tomorrow morning could feel
              <br />
              <span className="italic font-light">a little lighter.</span>
            </h2>
            <p className="mt-6 text-lg text-white/80 max-w-xl mx-auto">
              Sign up in 60 seconds. Wake up to your first morning report tomorrow. Free forever — upgrade only when your crew has already paid for itself.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="#top"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-1 font-bold rounded-full hover:shadow-2xl hover:-translate-y-0.5 transition-all"
              >
                Start free
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
              <a
                href="#dashboard"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-full hover:bg-white/20 transition-all border border-white/30"
              >
                See it work first
              </a>
            </div>
            <p className="mt-5 text-xs text-white/60 font-medium">
              No credit card · Free forever plan · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ====================================================================
//  FOOTER
// ====================================================================

function Footer() {
  return (
    <footer className="bg-plum text-blush mt-auto">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-14">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-2 to-peach-1 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-white" />
              </div>
              <span className="font-display text-xl font-medium">Hearthwork</span>
            </div>
            <p className="text-sm text-blush/70 max-w-md leading-relaxed">
              A crew that handles the busywork so humans can do the human work. Built for young founders, small business owners, and anyone who would rather spend their day on the work they love.
            </p>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-peach-2 mb-3">
              Product
            </div>
            <ul className="space-y-2 text-sm text-blush/80">
              <li><a href="#services" className="hover:text-peach-2 transition-colors">Services</a></li>
              <li><a href="#dashboard" className="hover:text-peach-2 transition-colors">Dashboard</a></li>
              <li><a href="#palette" className="hover:text-peach-2 transition-colors">Brand</a></li>
              <li><a href="#pricing" className="hover:text-peach-2 transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-peach-2 mb-3">
              Company
            </div>
            <ul className="space-y-2 text-sm text-blush/80">
              <li><a href="#" className="hover:text-peach-2 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-peach-2 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-peach-2 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-peach-2 transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-blush/15 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-blush/60">
            © 2026 Hearthwork. A brand that shows up warm.
          </p>
          <p className="text-xs text-blush/60 italic font-display">
            — a warm start for the work ahead
          </p>
        </div>
      </div>
    </footer>
  )
}

// ====================================================================
//  PAGE
// ====================================================================

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-blush">
      <StickyNav />
      <main className="flex-1">
        <Hero />
        <StatsBar />
        <ServicesSection />
        <PaletteSection />
        <DashboardSection />
        <TestimonialsSection />
        <PricingSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
