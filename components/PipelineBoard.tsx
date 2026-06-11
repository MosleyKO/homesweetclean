'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Phone, Mail, MapPin, ArrowRight, UserCheck, Globe, PhoneCall, Users, Plus } from 'lucide-react'

const STAGES = [
  { key: 'new_inquiry', label: 'New Inquiry', color: '#854d0e', bg: '#fef9c3' },
  { key: 'contacted', label: 'Contacted', color: '#1d4ed8', bg: '#dbeafe' },
  { key: 'quoted', label: 'Quoted', color: '#6d28d9', bg: '#ede9fe' },
  { key: 'scheduled', label: 'Scheduled', color: '#065f46', bg: '#d1fae5' },
  { key: 'not_interested', label: 'Not Interested', color: '#6b7280', bg: '#f1f5f9' },
]

const ADVANCE_STAGES = STAGES.filter(s => s.key !== 'not_interested')

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  website_form: <Globe size={11} />,
  phone: <PhoneCall size={11} />,
  referral: <Users size={11} />,
  manual: <Plus size={11} />,
}

const SOURCE_LABELS: Record<string, string> = {
  website_form: 'Website',
  phone: 'Phone',
  referral: 'Referral',
  manual: 'Manual',
  google: 'Google',
  facebook: 'Facebook',
}

type Lead = {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  property_type: string | null
  frequency: string | null
  bedrooms: string | null
  source: string | null
  source_detail: string | null
  pipeline_stage: string
  created_at: string
}

function LeadCard({ lead, onStageChange, onConvert, converting, allStages }: {
  lead: Lead
  onStageChange: (id: string, stage: string) => Promise<void>
  onConvert: (id: string) => Promise<void>
  converting: string | null
  allStages: typeof STAGES
}) {
  const advanceStages = ADVANCE_STAGES
  const stageIdx = advanceStages.findIndex(s => s.key === lead.pipeline_stage)
  const nextStage = advanceStages[stageIdx + 1]
  const isScheduled = lead.pipeline_stage === 'scheduled'
  const isNotInterested = lead.pipeline_stage === 'not_interested'
  const isConverting = converting === lead.id
  const sourceLabel = SOURCE_LABELS[lead.source ?? ''] ?? lead.source ?? 'Manual'
  const sourceIcon = SOURCE_ICONS[lead.source ?? ''] ?? <Plus size={11} />
  const daysSince = Math.floor((Date.now() - new Date(lead.created_at).getTime()) / 86400000)

  return (
    <div style={{
      background: 'white',
      borderRadius: 12,
      border: '1px solid var(--line)',
      padding: '16px',
      marginBottom: 12,
    }}>
      {/* Name + source */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-fraunces), serif', fontWeight: 600, fontSize: 15, color: 'var(--teal)', marginBottom: 3 }}>
            {lead.name}
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif',
            letterSpacing: '0.06em', padding: '2px 7px', borderRadius: 20,
            background: 'var(--blush-bg)', color: 'var(--blush)',
          }}>
            {sourceIcon} {sourceLabel}
          </span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', marginLeft: 8 }}>
          {daysSince === 0 ? 'Today' : daysSince === 1 ? '1d ago' : `${daysSince}d ago`}
        </span>
      </div>

      {/* Contact details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
        {lead.address && (
          <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
            <MapPin size={12} color='var(--muted)' strokeWidth={1.75} />
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>{lead.address}</span>
          </div>
        )}
        {lead.phone && (
          <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
            <Phone size={12} color='var(--muted)' strokeWidth={1.75} />
            <a href={`tel:${lead.phone}`} style={{ fontSize: 12, color: 'var(--teal)', textDecoration: 'none' }}>{lead.phone}</a>
          </div>
        )}
        {lead.email && (
          <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
            <Mail size={12} color='var(--muted)' strokeWidth={1.75} />
            <a href={`mailto:${lead.email}`} style={{ fontSize: 12, color: 'var(--teal)', textDecoration: 'none' }}>{lead.email}</a>
          </div>
        )}
        {(lead.frequency || lead.bedrooms) && (
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
            {[lead.frequency, lead.bedrooms ? `${lead.bedrooms} bed` : null].filter(Boolean).join(' · ')}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link href={`/admin/clients/${lead.id}`} style={{
          fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif',
          letterSpacing: '0.06em', color: 'var(--muted)', textDecoration: 'none',
          padding: '6px 12px', borderRadius: 8, border: '1px solid var(--line)',
        }}>
          View
        </Link>

        {isNotInterested ? (
          <button
            onClick={() => onStageChange(lead.id, 'new_inquiry')}
            style={{
              fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif',
              letterSpacing: '0.06em', color: 'var(--teal)', background: 'var(--cream)',
              border: '1px solid var(--line)', padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 5,
            }}
          >
            <ArrowRight size={12} /> Reopen
          </button>
        ) : isScheduled ? (
          <>
            <button
              onClick={() => onConvert(lead.id)}
              disabled={isConverting}
              style={{
                fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif',
                letterSpacing: '0.06em', color: 'white', background: 'var(--teal)',
                border: 'none', padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 5, opacity: isConverting ? 0.6 : 1,
              }}
            >
              <UserCheck size={12} />
              {isConverting ? 'Converting...' : 'Convert to Client'}
            </button>
            <button
              onClick={() => onStageChange(lead.id, 'not_interested')}
              style={{
                fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif',
                letterSpacing: '0.06em', color: '#6b7280', background: 'white',
                border: '1px solid var(--line)', padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
              }}
            >
              Not Interested
            </button>
          </>
        ) : nextStage ? (
          <>
            <button
              onClick={() => onStageChange(lead.id, nextStage.key)}
              style={{
                fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif',
                letterSpacing: '0.06em', color: 'var(--teal)', background: 'var(--cream)',
                border: '1px solid var(--line)', padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}
            >
              <ArrowRight size={12} /> {nextStage.label}
            </button>
            <button
              onClick={() => onStageChange(lead.id, 'not_interested')}
              style={{
                fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-montserrat), sans-serif',
                letterSpacing: '0.06em', color: '#6b7280', background: 'white',
                border: '1px solid var(--line)', padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
              }}
            >
              Not Interested
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}

export default function PipelineBoard({ leads: initialLeads }: { leads: Lead[] }) {
  const router = useRouter()
  const [leads, setLeads] = useState(initialLeads)
  const [converting, setConverting] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('new_inquiry')

  const leadsBy = (stage: string) => leads.filter(l => l.pipeline_stage === stage)

  const handleStageChange = async (id: string, stage: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, pipeline_stage: stage } : l))
    await fetch('/api/leads/stage', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, stage }),
    })
    router.refresh()
  }

  const handleConvert = async (id: string) => {
    setConverting(id)
    const res = await fetch('/api/leads/convert', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      router.push(`/admin/clients/${id}`)
    } else {
      setConverting(null)
      alert('Something went wrong. Please try again.')
    }
  }

  const cardProps = { onStageChange: handleStageChange, onConvert: handleConvert, converting, allStages: STAGES }

  return (
    <>
      {/* Desktop kanban */}
      <div className="pipeline-desktop" style={{ display: 'grid', gridTemplateColumns: `repeat(${STAGES.length}, 1fr)`, gap: 16, alignItems: 'start' }}>
        {STAGES.map(stage => {
          const stageLeads = leadsBy(stage.key)
          return (
            <div key={stage.key}>
              {/* Column header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 12, padding: '8px 12px', borderRadius: 8,
                background: stage.bg,
              }}>
                <span style={{
                  fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11,
                  fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: stage.color,
                }}>
                  {stage.label}
                </span>
                <span style={{
                  fontFamily: 'var(--font-montserrat), sans-serif', fontSize: 11,
                  fontWeight: 700, color: stage.color,
                  background: 'rgba(255,255,255,0.6)', padding: '1px 7px', borderRadius: 20,
                }}>
                  {stageLeads.length}
                </span>
              </div>

              {stageLeads.length === 0 ? (
                <div style={{
                  padding: '24px 16px', textAlign: 'center', color: 'var(--muted)',
                  fontSize: 12, border: '1.5px dashed var(--line)', borderRadius: 12,
                  fontFamily: 'var(--font-outfit), sans-serif',
                }}>
                  No leads
                </div>
              ) : (
                stageLeads.map(lead => (
                  <LeadCard key={lead.id} lead={lead} {...cardProps} />
                ))
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile tabbed view */}
      <div className="pipeline-mobile">
        {/* Stage tabs */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto',
          paddingBottom: 4, scrollbarWidth: 'none',
        }}>
          {STAGES.map(stage => {
            const count = leadsBy(stage.key).length
            const active = activeTab === stage.key
            return (
              <button
                key={stage.key}
                onClick={() => setActiveTab(stage.key)}
                style={{
                  flexShrink: 0, padding: '7px 14px', borderRadius: 20,
                  border: active ? 'none' : '1px solid var(--line)',
                  background: active ? stage.bg : 'white',
                  color: active ? stage.color : 'var(--muted)',
                  fontFamily: 'var(--font-montserrat), sans-serif',
                  fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {stage.label}
                <span style={{
                  background: active ? 'rgba(255,255,255,0.6)' : 'var(--line)',
                  color: active ? stage.color : 'var(--muted)',
                  borderRadius: 20, padding: '1px 6px', fontSize: 10,
                }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Cards for active tab */}
        {leadsBy(activeTab).length === 0 ? (
          <div style={{
            padding: '40px 16px', textAlign: 'center', color: 'var(--muted)',
            fontSize: 13, border: '1.5px dashed var(--line)', borderRadius: 12,
            fontFamily: 'var(--font-outfit), sans-serif',
          }}>
            No leads in this stage
          </div>
        ) : (
          leadsBy(activeTab).map(lead => (
            <LeadCard key={lead.id} lead={lead} {...cardProps} />
          ))
        )}
      </div>

      <style>{`
        .pipeline-desktop { display: grid; }
        .pipeline-mobile { display: none; }
        @media (max-width: 768px) {
          .pipeline-desktop { display: none; }
          .pipeline-mobile { display: block; }
        }
      `}</style>
    </>
  )
}
