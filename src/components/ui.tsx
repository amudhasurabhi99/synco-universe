'use client'
import { T } from './tokens'
import { CSSProperties } from 'react'

export function Dot({ size=8, color=T.green, glow=false, pulse=false, style={} }: { size?:number, color?:string, glow?:boolean, pulse?:boolean, style?:CSSProperties }) {
  return <span style={{ display:'inline-block', width:size, height:size, borderRadius:'50%', background:color, boxShadow:glow?`0 0 0 2px ${color}33, 0 0 12px ${color}66`:`0 0 0 2px ${color}33`, animation:pulse?'dotPulse 1.8s ease-in-out infinite':'none', flex:'0 0 auto', ...style }} />
}

type Tone = 'blue'|'green'|'amber'|'red'|'purple'|'neutral'
export function Badge({ tone='blue', children, style={} }: { tone?:Tone, children:React.ReactNode, style?:CSSProperties }) {
  const m: Record<Tone,any> = {
    blue:{bg:T.blueBg,fg:T.blue,bd:'rgba(59,130,246,0.3)'},
    green:{bg:T.greenBg,fg:T.green,bd:'rgba(34,197,94,0.3)'},
    amber:{bg:T.amberBg,fg:T.amber,bd:'rgba(245,158,11,0.3)'},
    red:{bg:T.redBg,fg:T.red,bd:'rgba(239,68,68,0.3)'},
    purple:{bg:T.purpleBg,fg:T.purple,bd:'rgba(139,92,246,0.3)'},
    neutral:{bg:'rgba(255,255,255,0.05)',fg:T.t2,bd:T.b1},
  }
  const c = m[tone]
  return <span style={{ display:'inline-flex',alignItems:'center',gap:4,fontSize:11,fontWeight:500,lineHeight:1,padding:'3px 8px',borderRadius:4,background:c.bg,color:c.fg,border:`1px solid ${c.bd}`,letterSpacing:0.2,...style }}>{children}</span>
}

type BV = 'primary'|'primary-loading'|'secondary'|'tone'|'purple-grad'|'purple-grad-loading'
type BS = 'compact'|'standard'|'prominent'|'hero'
export function Button({ variant='secondary', size='standard', tone, children, onClick, disabled, style={} }: { variant?:BV, size?:BS, tone?:string, children:React.ReactNode, onClick?:()=>void, disabled?:boolean, style?:CSSProperties }) {
  const h = {compact:32,standard:36,prominent:40,hero:44}[size]
  const base: CSSProperties = { height:h, padding:size==='compact'?'0 12px':'0 20px', borderRadius:8, fontSize:size==='compact'?12:13, fontWeight:500, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all 200ms ease', cursor:disabled?'not-allowed':'pointer', opacity:disabled?0.5:1, border:'1px solid transparent', whiteSpace:'nowrap' }
  let v: CSSProperties = {}
  if (variant==='primary') v={background:'linear-gradient(135deg,#3b82f6,#8b5cf6)',color:'#fff',border:'1px solid rgba(255,255,255,0.08)'}
  else if (variant==='primary-loading') v={backgroundImage:'linear-gradient(110deg,#3b82f6 0%,#8b5cf6 25%,#6366f1 50%,#8b5cf6 75%,#3b82f6 100%)',backgroundSize:'200% 100%',animation:'shimmerBg 2s linear infinite',color:'#fff',border:'1px solid rgba(255,255,255,0.08)'}
  else if (variant==='secondary') v={background:'transparent',color:T.t2,border:`1px solid ${T.b2}`}
  else if (variant==='tone') { const c={green:{bg:T.greenBg,fg:T.green,bd:'rgba(34,197,94,0.3)'},red:{bg:T.redBg,fg:T.red,bd:'rgba(239,68,68,0.3)'},blue:{bg:T.blueBg,fg:T.blue,bd:'rgba(59,130,246,0.3)'},purple:{bg:T.purpleBg,fg:T.purple,bd:'rgba(139,92,246,0.3)'}}[tone||'blue']; v={background:c.bg,color:c.fg,border:`1px solid ${c.bd}`} }
  else if (variant==='purple-grad') v={background:'linear-gradient(135deg,#8b5cf6,#3b82f6)',color:'#fff',border:'1px solid rgba(255,255,255,0.08)'}
  else if (variant==='purple-grad-loading') v={backgroundImage:'linear-gradient(110deg,#8b5cf6 0%,#3b82f6 25%,#6366f1 50%,#3b82f6 75%,#8b5cf6 100%)',backgroundSize:'200% 100%',animation:'shimmerBg 2s linear infinite',color:'#fff',border:'1px solid rgba(255,255,255,0.08)'}
  return <button onClick={onClick} disabled={disabled} style={{...base,...v,...style}}>{children}</button>
}

export function Card({ accent, padding='20px 24px', radius=12, children, style={} }: { accent?:string, padding?:string, radius?:number, children:React.ReactNode, style?:CSSProperties }) {
  return <div className={accent?`accent-top accent-${accent}`:''} style={{ background:T.bg1, border:`1px solid ${T.b1}`, borderRadius:radius, padding, position:'relative', ...style }}>{children}</div>
}

export function SectionLabel({ children, color=T.blue, style={} }: { children:React.ReactNode, color?:string, style?:CSSProperties }) {
  return <span style={{ fontSize:11, fontWeight:500, letterSpacing:0.5, textTransform:'uppercase' as const, color, ...style }}>{children}</span>
}

export function Divider({ vertical=false, style={} }: { vertical?:boolean, style?:CSSProperties }) {
  return <div style={{ background:T.b1, flex:'0 0 auto', ...(vertical?{width:1,alignSelf:'stretch'}:{height:1,width:'100%'}), ...style }} />
}
