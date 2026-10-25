import { useState } from 'react'
import { Bell, Bookmark, ChevronDown, ExternalLink, MapPin } from 'lucide-react'
import type { DeadlineReminder, ErasmusOpportunity } from '../types/erasmus'
import { getLanguageLocale, usePreferences } from '../preferences'

export default function OpportunityCard({ opportunity, saved, onSave, reminder, onToggleReminder, canSetReminder }: {
  opportunity: ErasmusOpportunity
  saved: boolean
  onSave: (id: number) => void
  reminder?: DeadlineReminder
  onToggleReminder: (id: number) => void
  canSetReminder: boolean
}) {
  const { t, language } = usePreferences()
  const [showDetails, setShowDetails] = useState(false)
  const isVerified = opportunity.verificationStatus === 'Verified'
  const grantCovers = opportunity.grantCoveragePercent >= 100

  return <article className="opportunity-card">
    <div className="card-top">
      <span className={`verification ${isVerified ? 'verified' : 'review'}`}><span /> {t(isVerified ? 'Verified source' : 'Needs review')}</span>
      <button className={`save-button ${saved ? 'saved' : ''}`} onClick={() => onSave(opportunity.id)} aria-label={t(saved ? 'Remove from shortlist' : 'Save to shortlist')}>
        <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />
      </button>
    </div>
    {!isVerified && <div className="catalog-caution">{t('Planning data only: verify GPA, grant, deadline, and course availability with the official source and your coordinator.')}</div>}
    <div className="uni-monogram">{opportunity.university.split(' ').map((word) => word[0]).join('').slice(0, 2)}</div>
    <h3>{opportunity.university}</h3>
    <div className="location"><MapPin size={14} /> {opportunity.city}, {t(opportunity.country)}</div>
    <div className="field-tags">{opportunity.studyFields.slice(0, 2).map((field) => <span key={field}>{t(field)}</span>)}</div>
    <div className="card-details">
      <div><small>{t('MIN. GPA')}</small><strong>{opportunity.minimumGpa.toFixed(1)}</strong></div>
      <div><small>{t('GRANT / MONTH')}</small><strong>EUR {opportunity.monthlyGrant}</strong></div>
      <div><small>{t('DEADLINE')}</small><strong>{new Date(opportunity.deadline).toLocaleDateString(getLanguageLocale(language), { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}</strong></div>
    </div>
    <div className="cost-snapshot">
      <div><span>{t('EST. MONTHLY TOTAL')}</span><strong>EUR {opportunity.studentBudgetEstimate}</strong><small>{t('Rent + basics')}</small></div>
      <div className={grantCovers ? 'cost-good' : 'cost-warn'}><span>{t('GRANT COVERS')}</span><strong>{opportunity.grantCoveragePercent}%</strong><small>{t(grantCovers ? 'Most core costs' : 'Plan extra savings')}</small></div>
    </div>
    <button className="details-toggle" type="button" onClick={() => setShowDetails((previous) => !previous)}>
      {t(showDetails ? 'Hide student guide' : 'See city, application & housing guide')}
      <ChevronDown size={14} className={showDetails ? 'rotated' : ''} />
    </button>
    {showDetails && <div className="student-guide">
      <div className="guide-block"><strong>{t('Which city fits?')}</strong><p>{t('The city cost context is provided below:')} {opportunity.city}: EUR {opportunity.monthlyRentEstimate} {t('rent plus')} EUR {opportunity.monthlyLivingEstimate} {t('for food, transport, phone, and basics. This is a planning estimate, not a guaranteed quote.')}</p></div>
      <div className="guide-block"><strong>{t('Does the grant cover it?')}</strong><p>EUR {opportunity.monthlyGrant} {t('grant against roughly')} EUR {opportunity.studentBudgetEstimate} {t('monthly costs.')}{grantCovers ? ` ${t('It can cover core costs if you choose shared housing.')}` : ` ${t('Expect to add about')} EUR ${Math.max(0, opportunity.studentBudgetEstimate - opportunity.monthlyGrant)} ${t('or reduce costs with shared housing.')}`}</p></div>
      <div className="guide-block"><strong>{t('Can your field apply?')}</strong><p>{opportunity.studyFields.map(t).join(', ')}. {t('Available levels:')} {opportunity.levels.map(t).join(' and ')}. {t('Check your home university agreement before applying.')}</p></div>
      <div className="guide-block"><strong>{t('Common documents to prepare')}</strong><p>{t('Requirements vary by university; confirm the final list with your exchange coordinator.')}</p><ul>{opportunity.applicationDocuments.map((document) => <li key={document}>{document}</li>)}</ul></div>
      <div className="guide-block"><strong>{t('City context')}</strong><p>{opportunity.studentExperience}</p></div>
      <div className="guide-block housing-block"><strong>{t('Affordable housing near {city}').replace('{city}', opportunity.city)}</strong><div className="housing-links">{opportunity.accommodationLinks.map((link) => <a key={link.name} href={link.url} target="_blank" rel="noreferrer"><span>{link.name}</span><small>{link.note}</small><ExternalLink size={13} /></a>)}</div></div>
      <div className="deadline-reminder-inline"><div><strong>{t('Application deadline reminder')}</strong><small>{reminder ? `${t('Email me {days} days before').replace('{days}', String(reminder.daysBefore))}${reminder.sentAt ? ` · ${t('Email sent')}` : ''}` : t('Get one email before this listed deadline.')}</small></div><button type="button" className={reminder ? 'reminder-action active' : 'reminder-action'} onClick={() => onToggleReminder(opportunity.id)}><Bell size={15} />{t(reminder ? 'Remove reminder' : canSetReminder ? 'Remind me 7 days before' : 'Sign in for a reminder')}</button></div>
    </div>}
    <div className="source-footer">
      <a className="source-link" href={opportunity.sourceUrl} target="_blank" rel="noreferrer">{t('View university source')} <ExternalLink size={13} /></a>
      <small>{t('Last checked')} {new Date(opportunity.lastVerifiedAt).toLocaleDateString(getLanguageLocale(language), { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}</small>
    </div>
  </article>
}
