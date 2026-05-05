'use client'
import { T } from './tokens'
import { CSSProperties } from 'react'

export function Dot({ size=8, color=T.green, pulse=false, style={} }: {
  size?: number, color?: string, pulse?: boolean, style?: CSSProperties
}) {
  return <span style={{
    display: 'inline-block', width: size, height: size,
    borderRadius: '50%', background: color, flex: '0 0 auto',
    animation: pulse ? 'pulse 2s ease-in-out infinite' : 'none',
    ...style
  }} />
}

type Tone = 'orange'|'blue'|'green'|'amber'|'red'|'purple'|'neutral'
export function Badge({ tone='neutral', children, style={} }: {
  tone?: Tone, children: React.ReactNode, style?: CSSProperties
}) {
  const m: Record<Tone,{bg:string,fg:string,bd:string}> = {
    orange: { bg: T.orangeLight, fg: T.orange, bd: T.orangeBorder },
    blue:   { bg: T.blueBg,     fg: T.blue,   bd: T.blueBorder },
    green:  { bg: T.greenBg,    fg: T.green,  bd: T.greenBorder },
    amber:  { bg: T.amberBg,    fg: T.amber,  bd: T.amberBorder },
    red:    { bg: T.redBg,      fg: T.red,    bd: T.redBorder },
    purple: { bg: T.purpleBg,   fg: T.purple, bd: T.purpleBorder },
    neutral:{ bg: T.bg3,        fg: T.t2,     bd: T.b1 },
  }
  const c = m[tone]
  return <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontSize: 11, fontWeight: 500, lineHeight: 1,
    padding: '3px 8px', borderRadius: 20,
    background: c.bg, color: c.fg,
    border: `1px solid ${c.bd}`,
    letterSpacing: 0.1, ...style,
  }}>{children}</span>
}

type BV = 'primary'|'primary-loading'|'secondary'|'ghost'|'danger'|'success'|'purple-grad'|'purple-grad-loading'
type BS = 'sm'|'md'|'lg'

export function Button({ variant='secondary', size='md', children, onClick, disabled, style={} }: {
  variant?: BV, size?: BS, children: React.ReactNode,
  onClick?: () => void, disabled?: boolean, style?: CSSProperties
}) {
  const h = { sm: 30, md: 36, lg: 42 }[size]
  const px = { sm: '0 12px', md: '0 18px', lg: '0 24px' }[size]
  const fs = { sm: 12, md: 13, lg: 14 }[size]

  const base: CSSProperties = {
    height: h, padding: px, borderRadius: 8,
    fontSize: fs, fontWeight: 500,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    transition: 'all 150ms ease',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    border: '1px solid transparent',
    whiteSpace: 'nowrap', letterSpacing: 0.1,
  }

  let v: CSSProperties = {}
  if (variant === 'primary') {
    v = { background: T.orange, color: '#fff', border: `1px solid ${T.orange}` }
  } else if (variant === 'primary-loading') {
    v = { backgroundImage: `linear-gradient(110deg, ${T.orange} 0%, #E8905A 40%, ${T.orange} 80%)`, backgroundSize: '200% 100%', animation: 'shimmerBg 1.5s linear infinite', color: '#fff' }
  } else if (variant === 'secondary') {
    v = { background: T.bg1, color: T.t1, border: `1px solid ${T.b2}` }
  } else if (variant === 'ghost') {
    v = { background: 'transparent', color: T.t2, border: '1px solid transparent' }
  } else if (variant === 'danger') {
    v = { background: T.redBg, color: T.red, border: `1px solid ${T.redBorder}` }
  } else if (variant === 'success') {
    v = { background: T.greenBg, color: T.green, border: `1px solid ${T.greenBorder}` }
  } else if (variant === 'purple-grad') {
    v = { background: `linear-gradient(135deg, ${T.purple}, ${T.blue})`, color: '#fff' }
  } else if (variant === 'purple-grad-loading') {
    v = { backgroundImage: `linear-gradient(110deg, ${T.purple} 0%, ${T.blue} 40%, ${T.purple} 80%)`, backgroundSize: '200% 100%', animation: 'shimmerBg 1.5s linear infinite', color: '#fff' }
  }

  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...v, ...style }}>{children}</button>
}

export function Card({ children, style={}, padding='20px 24px', radius=12 }: {
  children: React.ReactNode, style?: CSSProperties, padding?: string, radius?: number
}) {
  return <div style={{
    background: T.bg1,
    border: `1px solid ${T.b1}`,
    borderRadius: radius,
    padding,
    ...style,
  }}>{children}</div>
}

export function Label({ children, color=T.t3, style={} }: {
  children: React.ReactNode, color?: string, style?: CSSProperties
}) {
  return <span style={{
    fontSize: 11, fontWeight: 500, letterSpacing: 0.8,
    textTransform: 'uppercase' as const, color, ...style,
  }}>{children}</span>
}

export function Divider({ style={} }: { style?: CSSProperties }) {
  return <div style={{ height: 1, background: T.b1, width: '100%', ...style }} />
}
