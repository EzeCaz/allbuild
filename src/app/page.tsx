'use client'

import { useEffect, useRef, useState } from 'react'
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
  CheckCircle2,
  Clock,
  TrendingUp,
  Star,
  Quote,
  Menu,
  X,
  Play,
  ShieldCheck,
  Repeat,
  HandHeart,
} from 'lucide-react'
import { OnboardingModal } from '@/components/onboarding-modal'

// ====================================================================
//  IMAGE LIBRARY (European entrepreneur portraits, OSS-hosted)
// ====================================================================

const IMG = {
  laia:      'https://sfile.chatglm.cn/images-ppt/2ddd91cd17fc.jpg',
  marco:     'https://sfile.chatglm.cn/images-ppt/4eb2c04e18c6.jpg',
  hannah:    'https://sfile.chatglm.cn/images-ppt/bcde43a26d8c.jpg',
  olivia:    'https://sfile.chatglm.cn/images-ppt/73eeb1fc5215.jpg',
  dima:      'https://sfile.chatglm.cn/images-ppt/894813b011d7.jpg',
  amara:     'https://sfile.chatglm.cn/images-ppt/f5032d341007.jpg',
  viktor:    'https://sfile.chatglm.cn/images-ppt/491a9bc47ede.jpg',
  cafe:      'https://sfile.chatglm.cn/images-ppt/0f1f18143ad5.jpg',
  salon:     'https://sfile.chatglm.cn/images-ppt/516830abc967.jpg',
  freelancer:'https://sfile.chatglm.cn/images-ppt/867a2c88c3f0.jpg',
  contractor:'https://sfile.chatglm.cn/images-ppt/276d0f338a97.jpg',
  maya:      'https://sfile.chatglm.cn/images-ppt/aa4ff7b764fc.jpg',
  theo:      'https://sfile.chatglm.cn/images-ppt/27d244dd8528.png',
  lena:      'https://sfile.chatglm.cn/images-ppt/58aade9f8461.jpeg',
  owen:      'https://sfile.chatglm.cn/images-ppt/c0efa07d4114.jpg',
  heroFounder: 'https://sfile.chatglm.cn/images-ppt/d82879b1b7de.jpeg',
} as const

// ====================================================================
//  DATA
// ====================================================================

const SERVICES = [
  { icon: Users, name: 'The Coordinator', origin: 'Originally: The Orchestrator', desc: 'Nothing falls through the cracks. Every task picked up by the right crew member, every time.', accent: 'peach', founder: { name: 'Sofia', role: 'Cafe owner · Barcelona', img: IMG.cafe } },
  { icon: Heart, name: 'People Memory', origin: 'Originally: Pule', desc: 'We remember your customers, suppliers, and team — so you never explain a relationship twice.', accent: 'purple', founder: { name: 'Giulia', role: 'Salon owner · Milano', img: IMG.salon } },
  { icon: FileText, name: 'Knowledge at Hand', origin: 'Originally: Albert', desc: 'Documents, meetings, and notes become a searchable library the whole crew can draw on.', accent: 'purple', founder: { name: 'Lena', role: 'Freelance designer · Berlin', img: IMG.freelancer } },
  { icon: Zap, name: 'Always-On Crew', origin: 'Originally: Always-on Services', desc: 'Background helpers keep working when you are not. Scheduled tasks, monitoring, follow-ups.', accent: 'peach', founder: { name: 'Felix', role: 'Contractor · London', img: IMG.contractor } },
  { icon: Calendar, name: 'Tool Connections', origin: 'Originally: Tool Integrations', desc: 'We plug into the apps you already use — email, calendar, tasks, messaging, content.', accent: 'purple', founder: { name: 'Laia', role: 'Florist · Barcelona', img: IMG.laia } },
  { icon: Sparkles, name: 'The Dashboard', origin: 'Originally: Operator Dashboard', desc: 'One calm screen for what is done, what is in progress, and what needs your eyes.', accent: 'peach', founder: { name: 'Marco', role: 'Coffee roaster · Milano', img: IMG.marco } },
  { icon: CheckCircle2, name: 'Sign-Off Loop', origin: 'Originally: Review Workflows', desc: 'Nothing important ships without your say-so. Your crew checks its work and waits for your nod.', accent: 'purple', founder: { name: 'Hannah', role: 'Consultant · Berlin', img: IMG.hannah } },
  { icon: Mail, name: 'Crew Members', origin: 'Originally: Agent Personas', desc: 'Specialist teammates, each with a role — scheduling, follow-ups, research, bookkeeping.', accent: 'peach', founder: { name: 'Olivia', role: 'Studio founder · London', img: IMG.olivia } },
] as const

const PRINCIPLES = [
  { icon: HandHeart, name: 'Always warm', desc: 'We greet you like a regular. Never cold, never transactional. Even error messages sound human — because the people we serve are people, not users.', color: '#F33167' },
  { icon: ShieldCheck, name: 'Always human-approved', desc: 'Nothing important ships without your nod. We check our own work, flag anything uncertain, and wait for your sign-off on anything that matters. You stay in control.', color: '#8954AB' },
  { icon: Zap, name: 'Always capable', desc: 'Calm confidence that things will get handled. No false modesty, no overpromising. We do what we say, and we say what we did.', color: '#B464AD' },
  { icon: Repeat, name: 'Always learning', desc: 'The longer we work with you, the more we know your customers, your tone, your quirks. We get better every week — quietly, in the background, without asking for credit.', color: '#FF7E5D' },
] as const

const WHO_FOUNDERS = [
  { name: 'Laia Puig', role: 'Florist · scaling to 3 locations', city: 'Barcelona', img: IMG.laia, color: '#F33167' },
  { name: 'Marco Rinaldi', role: 'Coffee roaster · 2-person team', city: 'Milano', img: IMG.marco, color: '#8954AB' },
  { name: 'Hannah Weber', role: 'Solo consultant', city: 'Berlin', img: IMG.hannah, color: '#FF7E5D' },
  { name: 'Olivia Bennett', role: 'Studio founder · 12 people', city: 'London', img: IMG.olivia, color: '#B464AD' },
  { name: 'Viktor Mayer', role: 'Scaling SaaS startup · Series A', city: 'Berlin', img: IMG.viktor, color: '#8954AB' },
  { name: 'Amara Okafor', role: 'Hi-tech founder · AI infrastructure', city: 'London', img: IMG.amara, color: '#F33167' },
  { name: 'Dima Sokolov', role: 'Tech founder · dev tools', city: 'Berlin', img: IMG.dima, color: '#FF7E5D' },
  { name: 'Sofia Marín', role: 'Cafe owner · 2 locations', city: 'Barcelona', img: IMG.cafe, color: '#B464AD' },
] as const

const STATS = [
  { value: 3238, label: 'Human hours reclaimed', suffix: '' },
  { value: 9794, label: 'Work items completed', suffix: '' },
  { value: 120, label: 'Reusable skills', suffix: '+' },
  { value: 27, label: 'Tool integrations', suffix: '' },
]

const CREW = [
  { name: 'Maya', role: 'Reviews & Replies', color: '#F33167', status: 'drafting', img: IMG.maya },
  { name: 'Theo', role: 'Scheduling', color: '#8954AB', status: 'checking', img: IMG.theo },
  { name: 'Lena', role: 'Bookkeeping', color: '#B464AD', status: 'reconciling', img: IMG.lena },
  { name: 'Owen', role: 'Research', color: '#FF7E5D', status: 'reading', img: IMG.owen },
] as const

const CREW_ACTIVITIES = [
  'drafted a reply to a 3-star review on Google',
  "queued tomorrow morning's invoice batch",
  'flagged a scheduling conflict at 2pm Thursday',
  "pulled last quarter's revenue summary",
  'sent a follow-up to the new lead from Instagram',
  'booked the recurring Monday team sync',
  'cleaned up 14 duplicate contacts in your list',
  "drafted this week's customer newsletter",
  'caught a typo in the contract before it sent',
  'reminded you about the expiring domain renewal',
]

const TESTIMONIALS = [
  { quote: 'My mornings used to start with dread — 30 unread emails, three forgotten follow-ups. Now I wake up and Maya has already drafted the replies. I just say yes or no.', name: 'Laia Puig', role: 'Founder, Flors de Barcelona · Barcelona', img: IMG.laia, color: '#F33167' },
  { quote: "I run a two-person coffee roastery. We don't have a marketing team. Allbuild is our marketing team. It posts, it replies, it follows up — I just taste the coffee.", name: 'Marco Rinaldi', role: 'Co-owner, Torrefazione Milano · Milano', img: IMG.marco, color: '#8954AB' },
  { quote: 'We hit Series A and I was drowning — investor updates, hiring pipelines, customer research, all on me. Allbuild became my chief of staff overnight. I closed our next round without burning out.', name: 'Viktor Mayer', role: 'CEO, Flowstate (Series A SaaS) · Berlin', img: IMG.viktor, color: '#8954AB' },
  { quote: 'I was skeptical. Every "AI assistant" I tried before felt like a chatbot pretending to be a person. This is the first one that feels like a coworker who actually gets it.', name: 'Hannah Weber', role: 'Solo consultant, Weber Strategy · Berlin', img: IMG.hannah, color: '#FF7E5D' },
  { quote: 'I run AI infra. The irony of being drowned in ops work while building automation for others was not lost on me. Allbuild runs my investor reporting, my hiring screen, my weekly retros. I ship product again.', name: 'Amara Okafor', role: 'Founder, Nexus AI · London', img: IMG.amara, color: '#F33167' },
  { quote: 'I hired Allbuild to do admin. Six weeks later it is doing customer research, draft proposals, and weekly retrospectives. I did not ask for any of that. It just kept showing up.', name: 'Olivia Bennett', role: 'Founder, Loop Studio · London', img: IMG.olivia, color: '#B464AD' },
]

const STATS_FOUNDERS = [
  { name: 'Laia', img: IMG.laia },
  { name: 'Viktor', img: IMG.viktor },
  { name: 'Amara', img: IMG.amara },
  { name: 'Olivia', img: IMG.olivia },
  { name: 'Marco', img: IMG.marco },
  { name: 'Hannah', img: IMG.hannah },
]

const PRICING = [
  { name: 'Solo', price: '$500', cadence: 'per month', blurb: 'For freelancers and side hustles just getting started.', features: ['2 crew members', '3 tool connections', 'Daily digests', 'Email support'], cta: 'Get started', featured: false, founders: [IMG.freelancer, IMG.cafe, IMG.salon] },
  { name: 'Crew', price: '$1500', cadence: 'per month', blurb: 'For small business owners running daily operations.', features: ['8 crew members', 'Unlimited tool connections', 'Always-on services', 'Sign-off workflow', 'Knowledge library', 'Priority support'], cta: 'Get started', featured: true, founders: [IMG.laia, IMG.marco, IMG.hannah, IMG.olivia, IMG.contractor] },
  { name: 'Studio', price: 'Custom', cadence: 'talk to us', blurb: 'For teams and multi-location businesses.', features: ['Unlimited crew members', 'Custom skills & playbooks', 'SSO + audit logs', 'Dedicated success manager', 'Onboarding workshop'], cta: 'Book a call', featured: false, founders: [IMG.olivia, IMG.marco] },
]

const FLOW_STEPS = [
  { id: 0, name: 'Request', title: 'Work enters, three ways', desc: 'A direct request from you, an external event (a customer message, a calendar trigger), or a scheduled run. Anything that needs doing arrives at the Coordinator.', icon: '📥', color: '#8954AB', detail: ['You: "Follow up with Marcus about the wholesale order"', 'External: New 3-star Google review posted', 'Scheduled: Tuesday 9am — send the weekly newsletter'] },
  { id: 1, name: 'Coordinator', title: 'The Coordinator routes the work', desc: 'The always-on coordinator reads every incoming request, decides which crew member owns it, prevents collisions, and ensures nothing waits silently for someone to notice.', icon: '🎯', color: '#B464AD', detail: ['Routes "follow up with Marcus" → Maya (Reviews & Replies)', 'Routes "3-star review" → Maya (drafts reply, holds for sign-off)', 'Routes "send newsletter" → Theo (Scheduling, queues for Tuesday)'] },
  { id: 2, name: 'Crew works', title: 'The right crew member picks it up', desc: 'Each crew member pulls relevant context from memory — people, past conversations, knowledge — does the work, and checks its own output before reporting back.', icon: '⚡', color: '#FF7E5D', detail: ["Maya pulls Marcus's last 5 emails from People Memory", "Maya drafts the reply, references last week's order, checks tone", 'Maya flags: "This mentions a 10% discount — needs your sign-off"'] },
  { id: 3, name: 'Sign-off', title: 'You stay in control of what matters', desc: 'Anything requiring judgment — money, reputation, new relationships — comes to you first. One calm screen, one click to approve or edit. The boring stuff ships on its own.', icon: '✓', color: '#F33167', detail: ["Maya's draft lands in your sign-off queue", 'You read it, edit one line, click approve', 'Maya sends the email, logs the interaction, updates Marcus\'s profile'] },
  { id: 4, name: 'Done', title: 'Work is done. Memory is updated. Lessons are captured.', desc: 'Every completed task enriches the system. The crew learns your tone, your customers, your preferences. Next time, the work starts a little further along.', icon: '✨', color: '#8954AB', detail: ['Marcus\'s profile updated: "Replied 11:42am, mentioned 10% discount"', 'Memory captured: "When offering discounts to wholesalers, lead with terms"', "Tomorrow morning's digest includes: \"Marcus reply sent — awaiting his response\""] },
] as const

// ====================================================================
//  HELPERS
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

function Avatar({ src, alt, size = 36, ring = '#FFFFFF', className = '' }: { src: string; alt: string; size?: number; ring?: string; className?: string }) {
  return (
    <img src={src} alt={alt} width={size} height={size} className={`rounded-full object-cover flex-shrink-0 ${className}`} style={{ width: size, height: size, border: `2px solid ${ring}` }} loading="lazy" />
  )
}

// ====================================================================
//  LOGO — Allbuild mark (official PNG logo)
//  Source: /public/allbuild-logo.png (784×644, ~4:3.3 aspect)
// ====================================================================

function Logo({ size = 32, className = '' }: { size?: number; className?: string }) {
  // PNG is 784×644 → aspect ratio ~1.217:1 (width:height)
  // At `size` px tall, width = size * 1.217
  const width = Math.round(size * (784 / 644))
  return (
    <img
      src="/allbuild-logo.png"
      alt="Allbuild logo"
      width={width}
      height={size}
      className={className}
      style={{ width, height: size, objectFit: 'contain' }}
    />
  )
}

// ====================================================================
//  STICKY NAV
// ====================================================================

function StickyNav({ onGetStarted }: { onGetStarted: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const navItems = [
    { label: 'Why', href: '#why' },
    { label: 'Who', href: '#who' },
    { label: 'How', href: '#how' },
    { label: 'Flow', href: '#flow' },
    { label: 'What', href: '#what' },
    { label: 'Founders', href: '#founders' },
    { label: 'Pricing', href: '#pricing' },
  ]
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-blush/85 backdrop-blur-xl border-b border-blush-line shadow-sm' : 'bg-transparent'}`}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex items-center justify-between h-16">
        <a href="#top" className="flex items-center gap-2.5 group">
          <Logo size={32} className="group-hover:scale-110 transition-transform" />
          <span className="font-display text-xl font-medium text-plum tracking-tight">Allbuild</span>
        </a>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className="px-3 py-2 text-sm font-medium text-muted-plum hover:text-purple-1 transition-colors rounded-md hover:bg-white/40">{item.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={onGetStarted} className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-purple-1 hover:bg-purple-2 rounded-full transition-all hover:shadow-lg hover:shadow-purple-1/30">Get started <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></button>
          <button className="md:hidden p-2 text-plum" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">{menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden bg-blush/95 backdrop-blur-xl border-b border-blush-line">
            <div className="px-6 py-3 flex flex-col">
              {navItems.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="py-2 text-sm font-medium text-plum">{item.label}</a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

// ====================================================================
//  HERO — with rotating crew/team/squad/staff
// ====================================================================

const ROTATING_WORDS = ['crew', 'team', 'squad', 'staff']

function Hero({ onGetStarted }: { onGetStarted: () => void }) {
  const [wordIdx, setWordIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => { setWordIdx((i) => (i + 1) % ROTATING_WORDS.length) }, 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <section id="top" className="relative min-h-screen bg-animated-gradient overflow-hidden flex items-center pt-20 pb-16">
      <div className="absolute top-32 left-[8%] w-24 h-24 rounded-full bg-peach-1/30 animate-floaty blur-sm" />
      <div className="absolute top-48 right-[12%] w-32 h-32 rounded-full bg-purple-1/25 animate-floaty-slow blur-sm" />
      <div className="absolute bottom-32 left-[15%] w-20 h-20 rounded-full bg-purple-2/30 animate-floaty blur-sm" />
      <div className="absolute bottom-48 right-[8%] w-16 h-16 rounded-full bg-peach-2/40 animate-floaty-slow blur-sm" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 grid lg:grid-cols-12 gap-10 items-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="lg:col-span-7 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-white/60 backdrop-blur-sm border border-white/80 text-xs font-semibold text-purple-1 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-peach-1 animate-pulse" />
            IN BETA · JOIN 200+ EUROPEAN FOUNDERS &amp; STARTUPS
          </div>

          <h1 className="font-display font-normal text-5xl sm:text-6xl lg:text-7xl leading-[1.15] tracking-tight text-plum">
            We believe founders deserve a{' '}
            <span className="relative inline-block perspective-[1000px]" style={{ overflow: 'visible' }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIdx}
                  initial={{ y: 24, opacity: 0, rotateX: -60 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  exit={{ y: -24, opacity: 0, rotateX: 60 }}
                  transition={{ duration: 0.45 }}
                  className="inline-block text-gradient-peach italic font-light"
                  style={{
                    transformOrigin: 'center center',
                    transformStyle: 'preserve-3d',
                    overflow: 'visible',
                    paddingRight: '0.15em',
                    paddingTop: '0.12em',
                    paddingBottom: '0.12em',
                  }}
                >
                  {ROTATING_WORDS[wordIdx]}
                </motion.span>
              </AnimatePresence>
            </span>,
            <br />
            not another <span className="text-gradient italic font-light">chatbot.</span>
          </h1>

          <p className="mt-7 text-lg lg:text-xl text-muted-plum max-w-xl mx-auto lg:mx-0 leading-relaxed">
            From the florist scaling to three locations to the Series A founder drowning in ops. From the solo consultant to the hi-tech team shipping AI infra. We give every founder a crew that handles the busywork, so they can do the work only they can do.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <button onClick={onGetStarted} className="inline-flex items-center justify-center px-7 py-3.5 bg-peach-1 hover:bg-peach-1/90 text-white font-semibold rounded-full transition-all hover:shadow-xl hover:shadow-peach-1/30 hover:-translate-y-0.5 animate-pulse-glow">Get started <ArrowRight className="w-4 h-4 ml-2" /></button>
            <a href="#flow" className="inline-flex items-center justify-center px-7 py-3.5 bg-white/70 backdrop-blur-sm hover:bg-white text-plum font-semibold rounded-full transition-all border border-white/80 hover:shadow-lg"><Play className="w-4 h-4 mr-2" /> See the crew in action</a>
          </div>
          <p className="mt-5 text-xs text-muted-plum font-medium tracking-wide">No credit card · Free forever plan · Cancel anytime</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="lg:col-span-5 relative">
          <HeroCard />
        </motion.div>
      </div>
    </section>
  )
}

function HeroCard() {
  return (
    <div className="relative">
      <div className="relative bg-white rounded-3xl shadow-2xl shadow-purple-1/15 p-6 border border-white">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <Avatar src={IMG.laia} alt="Laia" size={44} ring="#F33167" />
            <div>
              <div className="text-xs font-semibold text-muted-plum tracking-wider uppercase">Tuesday morning</div>
              <div className="font-display text-lg text-plum">Good morning, Laia.</div>
            </div>
          </div>
          <div className="flex -space-x-2">
            {CREW.slice(0, 4).map((c) => (
              <Avatar key={c.name} src={c.img} alt={c.name} size={28} ring="#FFFFFF" />
            ))}
          </div>
        </div>
        <div className="space-y-2.5">
          {[
            { text: 'Maya drafted 3 review replies', icon: '✓', color: '#F33167', crewImg: IMG.maya, crewName: 'Maya' },
            { text: 'Theo queued 5 invoices for Tuesday', icon: '✓', color: '#8954AB', crewImg: IMG.theo, crewName: 'Theo' },
            { text: 'Lena reconciled last week\'s books', icon: '✓', color: '#B464AD', crewImg: IMG.lena, crewName: 'Lena' },
            { text: 'Owen flagged 1 scheduling conflict', icon: '!', color: '#FF7E5D', crewImg: IMG.owen, crewName: 'Owen' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.15 }} className="flex items-center gap-3 p-3 rounded-xl bg-blush">
              <Avatar src={item.crewImg} alt={item.crewName} size={28} ring={item.color} />
              <div className="text-sm text-plum font-medium flex-1">{item.text}</div>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: item.color }}>{item.icon}</div>
            </motion.div>
          ))}
        </div>
        <div className="mt-5 pt-5 border-t border-blush-line">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-plum font-medium">One thing needs your eyes:</span>
            <span className="text-peach-1 font-semibold">1 sign-off</span>
          </div>
          <div className="mt-2 p-3 rounded-xl bg-peach-1/10 border border-peach-1/30">
            <div className="text-sm font-semibold text-plum">Reply to Marco re: wholesale order</div>
            <div className="text-xs text-muted-plum mt-0.5">Drafted by Maya · 2 min ago</div>
          </div>
        </div>
      </div>
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -top-5 -right-3 bg-peach-1 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">✦ 4 things done</motion.div>
      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute -bottom-4 -left-3 bg-purple-1 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">while you slept</motion.div>
    </div>
  )
}

// ====================================================================
//  STATS BAR
// ====================================================================

function StatsBar() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  return (
    <section className="py-16 bg-white/40 border-y border-blush-line">
      <div ref={ref} className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <div className="flex -space-x-3">
            {STATS_FOUNDERS.map((f, i) => (
              <Avatar key={i} src={f.img} alt={f.name} size={44} ring="#FAE3E3" />
            ))}
            <div className="w-11 h-11 rounded-full bg-purple-1 text-white flex items-center justify-center text-xs font-bold border-2 border-blush">200+</div>
          </div>
          <div className="text-sm text-muted-plum font-medium text-center sm:text-left">
            <span className="text-plum font-semibold">200+ young founders across Europe</span> already start their day with Allbuild
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <StatItem key={i} stat={stat} start={inView} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StatItem({ stat, start }: { stat: typeof STATS[number]; start: boolean }) {
  const value = useCountUp(stat.value, 1800, start)
  return (
    <div className="text-center">
      <div className="font-display text-4xl lg:text-5xl font-medium text-gradient">{value.toLocaleString()}{stat.suffix}</div>
      <div className="mt-2 text-xs lg:text-sm text-muted-plum font-medium tracking-wide uppercase">{stat.label}</div>
    </div>
  )
}

// ====================================================================
//  SECTION HEADER
// ====================================================================

function SectionHeader({ tag, title, subtitle, align = 'left' }: { tag: string; title: React.ReactNode; subtitle?: string; align?: 'left' | 'center' }) {
  return (
    <div className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      <div className={`inline-flex items-center gap-2 text-xs font-bold text-purple-1 tracking-[0.2em] uppercase mb-4 ${align === 'center' ? 'justify-center' : ''}`}>
        <div className="w-6 h-px bg-purple-1" />{tag}
      </div>
      <h2 className="font-display text-4xl lg:text-5xl font-normal text-plum leading-[1.05] tracking-tight">{title}</h2>
      {subtitle && <p className="mt-5 text-lg text-muted-plum leading-relaxed">{subtitle}</p>}
    </div>
  )
}

// ====================================================================
//  WHY SECTION
// ====================================================================

function WhySection() {
  return (
    <section id="why" className="py-24 relative overflow-hidden">
      <div className="absolute -top-20 -right-32 w-96 h-96 rounded-full bg-peach-1/8 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-32 w-96 h-96 rounded-full bg-purple-1/8 blur-3xl pointer-events-none" />
      <div className="relative mx-auto max-w-5xl px-6 lg:px-8">
        <SectionHeader tag="The Why" align="center" title={<>Because the work you love shouldn't come with a <span className="italic font-light text-gradient">tax.</span></>} />
        <div className="mt-14 max-w-3xl mx-auto space-y-6">
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.6 }} className="font-display text-2xl lg:text-3xl font-light text-plum leading-relaxed text-center italic">
            &ldquo;People don't buy what you do — they buy why you do it.&rdquo;
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-lg text-plum/85 leading-relaxed text-center">
            We believe founders shouldn't have to choose between the work they love and the work that pays for it. Whether you are a florist scaling to three locations, a Series A SaaS founder drowning in investor updates, a solo consultant, or a hi-tech team shipping AI infrastructure — the same tax applies. The work you hate is stealing time from the work only you can do.
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg text-plum/85 leading-relaxed text-center">
            We exist to change that. To give every founder — small business owner or scaling startup, solo operator or hi-tech team — a crew that handles the busywork. Not because we want to build clever software. Because we believe the work people love is precious, and the work people hate is a tax on it.
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, delay: 0.3 }} className="text-lg text-plum/85 leading-relaxed text-center">
            <span className="font-semibold text-peach-1">Our job is to lower that tax.</span> To give founders their time, their calm, and their mornings back. To make the technology disappear into the work, so the work can become human again.
          </motion.p>
        </div>
        <div className="mt-16 grid sm:grid-cols-3 gap-5">
          {[
            { title: 'Time', body: 'Founders lose hours every day to work they hate. We give those hours back.', color: '#F33167' },
            { title: 'Calm', body: 'Running a business means carrying the weight alone. We become a crew that shares the load.', color: '#8954AB' },
            { title: 'Mornings', body: 'The first hour of the day should feel like possibility, not dread. We make it so.', color: '#B464AD' },
          ].map((pillar, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: i * 0.1 }} className="bg-white rounded-2xl p-6 border border-blush-line">
              <div className="w-10 h-1 rounded-full mb-4" style={{ backgroundColor: pillar.color }} />
              <h3 className="font-display text-2xl font-medium text-plum mb-2">{pillar.title}</h3>
              <p className="text-sm text-muted-plum leading-relaxed">{pillar.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ====================================================================
//  WHO SECTION
// ====================================================================

function WhoSection() {
  return (
    <section id="who" className="py-24 bg-white/40 border-y border-blush-line">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader tag="The Who" align="center" title={<>Built for founders <span className="italic font-light text-gradient-peach">at every stage.</span></>} subtitle="From the solo florist to the Series A founder. From the cafe opening its second location to the hi-tech team shipping AI infrastructure. If you started something and now spend too much of your day on the work you hate — this is for you." />
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {['Solo founders', 'Small business owners', 'Scaling startups', 'Series A–B teams', 'Hi-tech founders', 'Studios & agencies', 'Multi-location operators', 'Consultants'].map((label, i) => (
            <span key={i} className="px-3 py-1.5 rounded-full bg-white border border-blush-line text-xs font-semibold text-plum">{label}</span>
          ))}
        </div>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WHO_FOUNDERS.map((founder, i) => (
            <motion.div key={founder.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: i * 0.08 }} className="bg-white rounded-3xl overflow-hidden border border-blush-line hover:shadow-xl hover:shadow-purple-1/10 transition-all hover:-translate-y-1">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src={founder.img} alt={founder.name} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-white tracking-wider uppercase" style={{ backgroundColor: founder.color }}>{founder.city}</div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white" style={{ background: `linear-gradient(to top, ${founder.color}E6 0%, transparent 100%)` }}>
                  <div className="font-display text-xl font-medium">{founder.name}</div>
                  <div className="text-xs opacity-90">{founder.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, delay: 0.4 }} className="mt-14 max-w-3xl mx-auto text-center">
          <p className="text-lg text-plum/85 leading-relaxed">
            This is for the florist in Barcelona scaling to three locations. The coffee roaster in Milano who would rather taste beans than chase invoices. The Series A founder in Berlin drowning in investor updates. The consultant tired of being her own assistant. The studio founder in London who started a business to do the work — not to manage software. The hi-tech founder who built automation for everyone except herself.
          </p>
          <p className="mt-6 font-display text-xl italic text-purple-1 font-light">If that sounds like you, you are in the right place.</p>
        </motion.div>
      </div>
    </section>
  )
}

// ====================================================================
//  HOW SECTION
// ====================================================================

function HowSection() {
  return (
    <section id="how" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader tag="The How" align="center" title={<>The way we deliver on the belief is by showing up like a <span className="italic font-light text-gradient">teammate</span>, not a tool.</>} subtitle="Most software is built to be used. We are built to be worked alongside. Four principles shape every interaction, every email, every decision your crew makes on your behalf." />
        <div className="mt-14 grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {PRINCIPLES.map((principle, i) => {
            const Icon = principle.icon
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: (i % 2) * 0.1 + Math.floor(i / 2) * 0.15 }} className="bg-white rounded-2xl p-7 border border-blush-line hover:shadow-xl hover:shadow-purple-1/10 transition-all">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: principle.color }}><Icon className="w-6 h-6 text-white" /></div>
                <h3 className="font-display text-2xl font-medium text-plum mb-2">{principle.name}</h3>
                <p className="text-sm text-muted-plum leading-relaxed">{principle.desc}</p>
              </motion.div>
            )
          })}
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-14 max-w-2xl mx-auto text-center">
          <p className="text-lg text-plum/85 leading-relaxed">Other tools ask you to learn their vocabulary. We learn yours. Other tools want you to remember they exist. We do our best work when you forget we are there.</p>
        </motion.div>
      </div>
    </section>
  )
}

// ====================================================================
//  FLOW DEMO SECTION
// ====================================================================

function FlowDemoSection() {
  const [activeStep, setActiveStep] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  useEffect(() => {
    if (!isAutoPlaying) return
    const t = setInterval(() => { setActiveStep((s) => (s + 1) % FLOW_STEPS.length) }, 3800)
    return () => clearInterval(t)
  }, [isAutoPlaying])
  const current = FLOW_STEPS[activeStep]
  return (
    <section id="flow" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader tag="The Flow" align="center" title={<>How a piece of work moves through <span className="italic font-light text-gradient">your crew.</span></>} subtitle="Five steps, end to end. Watch the animation play, or click any step to pause and read the detail. This is the loop that runs every working day, on every task, across your whole crew." />
        <div className="mt-8 flex justify-center">
          <button onClick={() => setIsAutoPlaying((v) => !v)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blush-line text-xs font-semibold text-plum hover:bg-blush-sat/40 transition-colors">
            <span className={`w-1.5 h-1.5 rounded-full ${isAutoPlaying ? 'bg-peach-1 animate-pulse' : 'bg-muted-plum'}`} />
            {isAutoPlaying ? 'Auto-playing · Click to pause' : 'Paused · Click to play'}
          </button>
        </div>
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute top-7 left-0 right-0 h-0.5 bg-blush-line" />
            <motion.div className="absolute top-7 left-0 h-0.5 bg-gradient-to-r from-purple-1 to-peach-1" animate={{ width: `${(activeStep / (FLOW_STEPS.length - 1)) * 100}%` }} transition={{ duration: 0.6, ease: 'easeInOut' }} />
            <div className="relative flex justify-between">
              {FLOW_STEPS.map((step, i) => {
                const isActive = i === activeStep
                const isPast = i < activeStep
                return (
                  <button key={step.id} onClick={() => { setActiveStep(i); setIsAutoPlaying(false) }} className="flex flex-col items-center gap-2 group" aria-label={`Step ${i + 1}: ${step.name}`}>
                    <motion.div animate={{ scale: isActive ? 1.2 : 1, backgroundColor: isActive ? step.color : isPast ? '#B464AD' : '#FFFFFF' }} transition={{ duration: 0.3 }} className="w-14 h-14 rounded-full flex items-center justify-center text-2xl border-2 shadow-sm" style={{ borderColor: isActive ? step.color : isPast ? '#B464AD' : '#F0D0D0' }}>
                      <span style={{ filter: isActive || isPast ? 'grayscale(0)' : 'grayscale(0.3)' }}>{step.icon}</span>
                    </motion.div>
                    <div className={`text-xs font-semibold tracking-wide uppercase transition-colors ${isActive ? 'text-plum' : 'text-muted-plum'}`}>{step.name}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        <div className="mt-14 max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeStep} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="bg-white rounded-3xl shadow-xl shadow-purple-1/10 border border-blush-line overflow-hidden">
              <div className="grid lg:grid-cols-12 gap-0">
                <div className="lg:col-span-5 p-8 lg:p-10" style={{ backgroundColor: `${current.color}0F` }}>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-4" style={{ backgroundColor: current.color, color: '#FFFFFF' }}>STEP {activeStep + 1} / {FLOW_STEPS.length}</div>
                  <div className="text-5xl mb-4">{current.icon}</div>
                  <h3 className="font-display text-2xl font-medium text-plum mb-3">{current.title}</h3>
                  <p className="text-sm text-muted-plum leading-relaxed">{current.desc}</p>
                </div>
                <div className="lg:col-span-7 p-8 lg:p-10">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-plum mb-4">What happens in this step</div>
                  <div className="space-y-3">
                    {current.detail.map((line, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.12 }} className="flex items-start gap-3 p-3 rounded-xl bg-blush/60">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: current.color }}>{i + 1}</div>
                        <div className="text-sm text-plum leading-relaxed">{line}</div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-6 pt-5 border-t border-blush-line flex items-center justify-between">
                    <div className="text-xs text-muted-plum">
                      {activeStep < FLOW_STEPS.length - 1 ? (<>Next: <span className="font-semibold text-plum">{FLOW_STEPS[activeStep + 1].name}</span></>) : (<>Loop complete · Work is done · Memory is richer</>)}
                    </div>
                    <button onClick={() => { setActiveStep((s) => (s + 1) % FLOW_STEPS.length); setIsAutoPlaying(false) }} className="inline-flex items-center gap-1 text-xs font-bold text-purple-1 hover:gap-2 transition-all">
                      {activeStep < FLOW_STEPS.length - 1 ? 'Next step' : 'Restart loop'}<ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.6 }} className="mt-14 max-w-2xl mx-auto text-center">
          <p className="text-lg text-plum/85 leading-relaxed">Five steps. Every task. Every day. The work enters, gets routed, gets done, gets signed off, gets remembered. <span className="font-semibold text-purple-1">That is the loop. That is the whole product.</span></p>
        </motion.div>
      </div>
    </section>
  )
}

// ====================================================================
//  WHAT SECTION
// ====================================================================

function WhatSection() {
  return (
    <section id="what" className="py-24 bg-white/40 border-y border-blush-line">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader tag="The What" align="center" title={<>So we built eight ways to make the day <span className="italic font-light text-gradient-peach">easier.</span></>} subtitle="Each one delivers on the belief. None of them require you to learn a new vocabulary or remember a new login. Together, they form a crew that handles the busywork — so you can do the human work. Pick what you need today; the rest are there when you grow into them." />
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
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: (index % 4) * 0.08 }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className="group relative bg-white rounded-2xl p-6 border border-blush-line transition-all duration-300 hover:shadow-xl hover:shadow-purple-1/10 hover:-translate-y-1 cursor-pointer overflow-hidden" style={{ borderColor: hovered ? accentColor : '#F0D0D0' }}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: bgTint }} />
      <div className="relative">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3" style={{ backgroundColor: accentColor }}><Icon className="w-5 h-5 text-white" /></div>
        <h3 className="font-display text-xl font-medium text-plum mb-1">{service.name}</h3>
        <p className="text-[10px] font-semibold text-muted-plum tracking-wider uppercase mb-3">{service.origin}</p>
        <p className="text-sm text-plum/80 leading-relaxed">{service.desc}</p>
        <div className="mt-5 pt-4 border-t border-blush-line flex items-center gap-2.5">
          <Avatar src={service.founder.img} alt={service.founder.name} size={28} ring={accentColor} />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-plum truncate">{service.founder.name}</div>
            <div className="text-[10px] text-muted-plum truncate">uses this · {service.founder.role}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ====================================================================
//  DASHBOARD SECTION
// ====================================================================

function DashboardSection() {
  const [activities, setActivities] = useState<{ id: number; crew: typeof CREW[number]; text: string; time: string }[]>([
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
      setActivities((prev) => [{ id: nextId.current++, crew, text, time: 'just now' }, ...prev.slice(0, 3).map((a) => ({ ...a, time: 'just now' }))].slice(0, 4))
    }, 3500)
    return () => clearInterval(t)
  }, [])
  return (
    <section id="dashboard" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader tag="The crew in action" align="center" title={<>This is what it looks like when <span className="italic font-light text-gradient">a crew shows up for you.</span></>} subtitle="No noise, no fifty tabs. Your crew reports in, you sign off, you go back to the work you actually love. This is a live feed — watch it for a few seconds." />
        <div className="mt-14 grid lg:grid-cols-12 gap-6">
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
                    <motion.div key={activity.id} layout initial={{ opacity: 0, y: -10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.3 }} className="flex items-start gap-3 p-3 rounded-xl hover:bg-blush/50 transition-colors">
                      <Avatar src={activity.crew.img} alt={activity.crew.name} size={36} ring={activity.crew.color} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-plum"><span className="font-semibold">{activity.crew.name}</span> <span className="text-muted-plum">{activity.text}</span></div>
                        <div className="text-xs text-muted-plum mt-0.5 flex items-center gap-1.5"><Clock className="w-3 h-3" />{activity.time}</div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-purple-1 flex-shrink-0 mt-1" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl shadow-purple-1/10 border border-blush-line p-6">
              <h3 className="font-display text-lg text-plum mb-4">Your crew</h3>
              <div className="space-y-3">
                {CREW.map((member) => (
                  <div key={member.name} className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar src={member.img} alt={member.name} size={40} ring={member.color} />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: member.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-plum">{member.name}</div>
                      <div className="text-xs text-muted-plum">{member.role}</div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-purple-1 font-semibold">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-1 animate-pulse" />{member.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-1 to-purple-2 rounded-3xl shadow-xl shadow-purple-1/20 p-6 text-plum">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5" />
                <span className="text-xs font-bold tracking-wider uppercase opacity-80">Today</span>
              </div>
              <div className="font-display text-3xl font-medium">14 things done</div>
              <div className="text-sm opacity-80 mt-1">3 hours reclaimed · 1 sign-off waiting</div>
              <div className="mt-5 pt-5 border-t border-[#2D1B2E]/20">
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
//  TESTIMONIALS SECTION
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
        <SectionHeader tag="Why these founders trust us" align="center" title={<>They did not buy <span className="italic font-light text-gradient-peach">what</span> we do.<br />They bought <span className="italic font-light text-gradient">why</span> we do it.</>} subtitle="These are not made-up personas. They are the kinds of people who use Allbuild every day — and what they actually say about it." />
        <div className="mt-14 relative">
          <AnimatePresence mode="wait">
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="bg-white rounded-3xl shadow-xl shadow-purple-1/10 border border-blush-line p-8 lg:p-12">
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-4 flex justify-center lg:justify-start">
                  <div className="relative">
                    <img src={current.img} alt={current.name} className="w-48 h-48 lg:w-56 lg:h-56 rounded-3xl object-cover shadow-xl" style={{ border: `4px solid ${current.color}` }} />
                    <div className="absolute -bottom-3 -right-3 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg" style={{ backgroundColor: current.color }}>✓ Verified user</div>
                  </div>
                </div>
                <div className="lg:col-span-8">
                  <Quote className="w-10 h-10 mb-4" style={{ color: current.color }} />
                  <p className="font-display text-2xl lg:text-3xl font-light text-plum leading-relaxed mb-8 italic">&ldquo;{current.quote}&rdquo;</p>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-semibold text-plum text-lg">{current.name}</div>
                      <div className="text-sm text-muted-plum">{current.role}</div>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-peach-1 fill-peach-1" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="mt-6 flex justify-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={`h-2 rounded-full transition-all ${i === idx ? 'w-8 bg-peach-1' : 'w-2 bg-blush-sat hover:bg-peach-1/50'}`} aria-label={`Testimonial ${i + 1}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ====================================================================
//  PRICING SECTION
// ====================================================================

function PricingSection({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader tag="The Offer" align="center" title={<>Simple pricing. <span className="italic font-light text-gradient">Honest</span> when you grow.</>} subtitle="No setup fees, no long contracts, no surprise overages. Start with the plan that fits today, upgrade when your crew has already paid for itself. Cancel anytime. The belief is the same at every tier." />
        <div className="mt-14 grid md:grid-cols-3 gap-6 items-stretch">
          {PRICING.map((tier, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: i * 0.1 }} className={`relative rounded-3xl p-8 flex flex-col ${tier.featured ? 'bg-gradient-to-br from-purple-1 to-purple-2 text-white shadow-2xl shadow-purple-1/25 md:-translate-y-4 lg:scale-105' : 'bg-white border border-blush-line text-plum'}`}>
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: '#F33167', color: '#FFFFFF' }}>Most popular</div>
              )}
              <div className="font-display text-2xl font-medium mb-2" style={tier.featured ? { color: '#F33167' } : undefined}>{tier.name}</div>
              <p className="text-sm mb-6" style={tier.featured ? { color: '#F33167', opacity: 0.85 } : undefined}>{tier.blurb}</p>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="font-display text-5xl font-medium" style={tier.featured ? { color: '#F33167' } : undefined}>{tier.price}</span>
                <span className="text-sm" style={tier.featured ? { color: '#F33167', opacity: 0.7 } : undefined}>{tier.cadence}</span>
              </div>
              <ul className="space-y-3 mb-6 flex-1">
                {tier.features.map((feat, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm" style={tier.featured ? { color: '#F33167' } : undefined}>
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={tier.featured ? { color: '#FFFFFF' } : undefined} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <div className="pb-6 border-b border-current/10">
                <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={tier.featured ? { color: '#F33167', opacity: 0.85 } : undefined}>Founders on {tier.name}</div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {tier.founders.map((img, k) => (
                      <Avatar key={k} src={img} alt={`Founder ${k + 1}`} size={28} ring={tier.featured ? '#F33167' : '#FFFFFF'} />
                    ))}
                  </div>
                  <span className="text-xs font-medium" style={tier.featured ? { color: '#F33167', opacity: 0.85 } : undefined}>+{tier.name === 'Solo' ? '120' : tier.name === 'Crew' ? '70' : '14'} others</span>
                </div>
              </div>
              <button onClick={onGetStarted} className={`mt-6 inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg ${tier.featured ? 'hover:opacity-90' : 'bg-blush text-plum hover:bg-blush-sat'}`} style={tier.featured ? { backgroundColor: '#F33167', color: '#FFFFFF' } : undefined}>
                {tier.cta}<ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ====================================================================
//  FINAL CTA — plum text (not white)
// ====================================================================

function FinalCTA({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-purple-1 via-purple-2 to-peach-1 rounded-[2.5rem] overflow-hidden">
          <div className="grid lg:grid-cols-2 items-center">
            <div className="p-12 lg:p-16 relative z-10">
              <div className="absolute top-10 right-10 w-3 h-3 rounded-full bg-peach-2 animate-pulse" />
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-white/40 backdrop-blur-sm border border-white/60 text-xs font-semibold text-plum tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-peach-2 animate-pulse" />THE WHY, AGAIN
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-normal text-plum leading-[1.05] tracking-tight">
                Tomorrow morning could feel<br /><span className="italic font-light">a little lighter.</span>
              </h2>
              <p className="mt-6 text-lg text-plum/85 max-w-md leading-relaxed">
                We believe the work people love is precious. We built Allbuild to give that work back to the people who do it. Sign up in 60 seconds. Wake up tomorrow to your first morning report.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row gap-3">
                <button onClick={onGetStarted} className="inline-flex items-center justify-center px-7 py-3.5 bg-white text-purple-1 font-bold rounded-full hover:shadow-2xl hover:-translate-y-0.5 transition-all">Get started<ArrowRight className="w-4 h-4 ml-2" /></button>
                <a href="#what" className="inline-flex items-center justify-center px-7 py-3.5 bg-white/40 backdrop-blur-sm text-plum font-bold rounded-full hover:bg-white/60 transition-all border border-white/60">See what we built</a>
              </div>
              <p className="mt-5 text-xs text-plum/70 font-medium">No credit card · Free forever plan · Cancel anytime</p>
              <div className="mt-8 pt-6 border-t border-[#2D1B2E]/15 flex items-center gap-3">
                <Avatar src={IMG.laia} alt="Laia" size={40} ring="#FFFFFF" />
                <div>
                  <div className="text-sm text-plum font-semibold">Laia Puig</div>
                  <div className="text-xs text-plum/70 italic">"I wish I had found this two years ago."</div>
                </div>
              </div>
            </div>
            <div className="relative h-80 lg:h-full min-h-[400px]">
              <img src={IMG.heroFounder} alt="Young European entrepreneur working happily" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-1/60 via-transparent to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-1/40 via-transparent to-transparent lg:bg-none" />
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl">
                <div className="text-[10px] font-bold text-muted-plum uppercase tracking-wider">Reclaimed this week</div>
                <div className="font-display text-2xl text-gradient font-medium">23.5 hrs</div>
              </motion.div>
            </div>
          </div>
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
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
              <Logo size={32} />
              <span className="font-display text-xl font-medium">Allbuild</span>
            </div>
            <p className="text-sm text-blush/70 max-w-md leading-relaxed mb-4">
              We believe small business owners shouldn't have to choose between the work they love and the work that pays for it. So we built a crew that handles the busywork — so they can do the human work.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {STATS_FOUNDERS.slice(0, 5).map((f, i) => (
                  <Avatar key={i} src={f.img} alt={f.name} size={28} ring="#2D1B2E" />
                ))}
              </div>
              <span className="text-xs text-blush/60">200+ European founders on board</span>
            </div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-peach-2 mb-3">The Golden Circle</div>
            <ul className="space-y-2 text-sm text-blush/80">
              <li><a href="#why" className="hover:text-peach-2 transition-colors">Why we exist</a></li>
              <li><a href="#who" className="hover:text-peach-2 transition-colors">Who we serve</a></li>
              <li><a href="#how" className="hover:text-peach-2 transition-colors">How we work</a></li>
              <li><a href="#flow" className="hover:text-peach-2 transition-colors">The flow</a></li>
              <li><a href="#what" className="hover:text-peach-2 transition-colors">What we built</a></li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-peach-2 mb-3">Company</div>
            <ul className="space-y-2 text-sm text-blush/80">
              <li><a href="#founders" className="hover:text-peach-2 transition-colors">Founders</a></li>
              <li><a href="#pricing" className="hover:text-peach-2 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-peach-2 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-peach-2 transition-colors">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-blush/15 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-blush/60">© 2026 Allbuild. A brand that shows up warm.</p>
          <p className="text-xs text-blush/60 italic font-display">— a warm start for the work ahead</p>
        </div>
      </div>
    </footer>
  )
}

// ====================================================================
//  PAGE
// ====================================================================

export default function Home() {
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const openOnboarding = () => setOnboardingOpen(true)
  const closeOnboarding = () => setOnboardingOpen(false)

  return (
    <div className="min-h-screen flex flex-col bg-blush">
      <StickyNav onGetStarted={openOnboarding} />
      <main className="flex-1">
        <Hero onGetStarted={openOnboarding} />
        <StatsBar />
        <WhySection />
        <WhoSection />
        <HowSection />
        <FlowDemoSection />
        <WhatSection />
        <DashboardSection />
        <TestimonialsSection />
        <PricingSection onGetStarted={openOnboarding} />
        <FinalCTA onGetStarted={openOnboarding} />
      </main>
      <Footer />
      <OnboardingModal open={onboardingOpen} onClose={closeOnboarding} />
    </div>
  )
}
