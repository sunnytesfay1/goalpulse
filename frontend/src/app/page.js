'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) router.push('/dashboard')
  }, [user, router])

  return (
    <main className="page-center">

      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        top: '25%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(74,222,128,0.06) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Logo */}
      <div className="logo">
        <div className="logo-icon gradient-bg">
          <span>G</span>
        </div>
        <span className="font-bold" style={{ fontSize: '20px', letterSpacing: '-0.01em' }}>
          GoalPulse
        </span>
      </div>

      {/* Hero */}
      <h1 style={{
        fontSize: '56px',
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: '20px',
        lineHeight: '1.1',
        letterSpacing: '-0.02em'
      }}>
        Build habits that
        <br />
        <span className="gradient-text">actually stick.</span>
      </h1>

      <p className="text-muted" style={{
        fontSize: '16px',
        textAlign: 'center',
        marginBottom: '40px',
        maxWidth: '420px',
        lineHeight: '1.6'
      }}>
        Set daily, weekly, and monthly goals. Get smart text reminders that keep you accountable — on your terms.
      </p>

      {/* CTAs */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        maxWidth: '320px'
      }}>
        <Link href="/register" className="btn-primary glow">
          Get Started Free
        </Link>
        <Link href="/login" className="btn-secondary">
          Sign In
        </Link>
      </div>

      {/* Features */}
      <div style={{
        marginTop: '96px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        maxWidth: '700px',
        width: '100%'
      }}>
        {[
          { icon: '🎯', title: 'Daily, Weekly, Monthly', desc: 'Goals that match your rhythm' },
          { icon: '💬', title: 'SMS Reminders', desc: 'Texts so you never forget' },
          { icon: '⚡', title: 'Passive or Persistent', desc: 'You choose the intensity' },
        ].map((f) => (
          <div key={f.title} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{f.icon}</div>
            <h3 className="font-semibold" style={{ fontSize: '14px', marginBottom: '4px', color: '#e5e7eb' }}>
              {f.title}
            </h3>
            <p className="text-xs text-muted">{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  )
}