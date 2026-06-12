'use client'

import { useState } from 'react'
import Link from 'next/link'

type Clean = {
  id: string
  started_at: string | null
  ended_at: string | null
  summary_sent: boolean
  clean_photos?: { url: string }[]
}

const SHOW = 5

function formatDuration(started: string, ended: string) {
  const mins = Math.round((new Date(ended).getTime() - new Date(started).getTime()) / 60000)
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60), m = mins % 60
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`
}

export default function CleanHistoryTable({ cleans }: { cleans: Clean[] }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? cleans : cleans.slice(0, SHOW)
  const hasMore = cleans.length > SHOW

  return (
    <>
      {/* Desktop table */}
      <div className="cd-history-table">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--cream)' }}>
              {['Date', 'Duration', 'Photos', 'Summary', ''].map(h => (
                <th key={h} style={{ padding: '10px 24px', textAlign: 'left', fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((clean) => {
              const duration = clean.started_at && clean.ended_at ? formatDuration(clean.started_at, clean.ended_at) : null
              return (
                <tr key={clean.id} style={{ borderTop: '1px solid var(--line)' }}>
                  <td style={{ padding: '14px 24px', fontWeight: 600, color: 'var(--teal)', fontSize: 14 }}>
                    {clean.started_at ? new Date(clean.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td style={{ padding: '14px 24px', color: 'var(--muted)', fontSize: 14 }}>{duration ?? (clean.started_at ? 'In progress' : '—')}</td>
                  <td style={{ padding: '14px 24px', color: 'var(--muted)', fontSize: 14 }}>{clean.clean_photos?.length ?? 0}</td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', background: clean.summary_sent ? '#dcfce7' : '#fef9c3', color: clean.summary_sent ? '#166534' : '#854d0e' }}>
                      {clean.summary_sent ? 'Sent' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <Link href={`/admin/cleans/${clean.id}`} style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--blush)', textDecoration: 'none', letterSpacing: '0.06em' }}>
                      View →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {hasMore && (
          <div style={{ padding: '14px 24px', borderTop: '1px solid var(--line)', textAlign: 'center' }}>
            <button
              onClick={() => setExpanded(e => !e)}
              style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--blush)', letterSpacing: '0.06em', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {expanded ? `SHOW LESS ↑` : `VIEW ALL ${cleans.length} CLEANS ↓`}
            </button>
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="cd-history-cards">
        {visible.map((clean) => {
          const duration = clean.started_at && clean.ended_at
            ? Math.round((new Date(clean.ended_at).getTime() - new Date(clean.started_at).getTime()) / 60000)
            : null
          return (
            <Link key={clean.id} href={`/admin/cleans/${clean.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid var(--line)', textDecoration: 'none', gap: 12 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--teal)', marginBottom: 3 }}>
                  {clean.started_at ? new Date(clean.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                  {duration ? `${duration} min` : clean.clean_photos?.length ? `${clean.clean_photos.length} photos` : 'In progress'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif', background: clean.summary_sent ? '#dcfce7' : '#fef9c3', color: clean.summary_sent ? '#166534' : '#854d0e' }}>
                  {clean.summary_sent ? 'Sent' : 'Pending'}
                </span>
                <span style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--blush)' }}>→</span>
              </div>
            </Link>
          )
        })}
        {hasMore && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--line)', textAlign: 'center' }}>
            <button
              onClick={() => setExpanded(e => !e)}
              style={{ fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 12, fontWeight: 600, color: 'var(--blush)', letterSpacing: '0.06em', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {expanded ? 'Show less ↑' : `View all ${cleans.length} cleans ↓`}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
