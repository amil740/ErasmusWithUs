import { useMemo, useState, type FormEvent } from 'react'
import { ArrowUpRight, Bell, ChevronDown, ExternalLink, MapPin, Search, Users } from 'lucide-react'
import { getPendingCatalogCorrections, reviewCatalogCorrection, submitCatalogCorrection } from '../lib/api'
import type { CatalogCorrection, DeadlineReminder, ErasmusOpportunity, User } from '../types/erasmus'
import { usePreferences } from '../preferences'
import FeaturedCampuses from './FeaturedCampuses'
import UniversityPhoto from './UniversityPhoto'

export default function UniversityDirectory({ opportunities, reminders, onToggleReminder, canSetReminder, onFindPeers, user, onSignIn, onCatalogChanged }: {
  opportunities: ErasmusOpportunity[]
  reminders: DeadlineReminder[]
  onToggleReminder: (id: number) => void
  canSetReminder: boolean
  onFindPeers: (opportunityId: number) => void
  user: User | null
  onSignIn: () => void
  onCatalogChanged: () => void
}) {
  const { t, language } = usePreferences()
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [correctionOpenId, setCorrectionOpenId] = useState<number | null>(null)
  const [correctionField, setCorrectionField] = useState('Deadline')
  const [correctionValue, setCorrectionValue] = useState('')
  const [correctionSourceUrl, setCorrectionSourceUrl] = useState('')
  const [correctionNote, setCorrectionNote] = useState('')
  const [correctionBusy, setCorrectionBusy] = useState(false)
  const [correctionNotice, setCorrectionNotice] = useState('')
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewKey, setReviewKey] = useState('')
  const [reviewQueue, setReviewQueue] = useState<CatalogCorrection[]>([])
  const [reviewError, setReviewError] = useState('')
  const [reviewBusyId, setReviewBusyId] = useState<number | null>(null)
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({})
  const countries = useMemo(() => [...new Set(opportunities.map((item) => item.country))].sort(), [opportunities])
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return opportunities.filter((item) => {
      const matchesQuery = !query || [item.university, item.city, item.country, ...item.studyFields]
        .some((value) => value.toLocaleLowerCase().includes(query))
      return matchesQuery && (!country || item.country === country)
    }).sort((a, b) => a.university.localeCompare(b.university))
  }, [opportunities, search, country])
  const averageGrant = opportunities.length
    ? Math.round(opportunities.reduce((sum, item) => sum + item.monthlyGrant, 0) / opportunities.length)
    : 0

  async function submitCorrection(event: FormEvent<HTMLFormElement>, opportunityId: number) {
    event.preventDefault()
    if (!user?.emailVerified) return
    setCorrectionBusy(true); setCorrectionNotice('')
    try {
      await submitCatalogCorrection(localStorage.getItem('erasmuswithus.token') ?? '', opportunityId, {
        fields: { [correctionField]: correctionValue.trim() },
        sourceUrl: correctionSourceUrl.trim(),
        note: correctionNote.trim(),
      })
      setCorrectionValue(''); setCorrectionSourceUrl(''); setCorrectionNote('')
      setCorrectionNotice('Thanks. Your source-backed correction is waiting for a review.')
      setCorrectionOpenId(null)
    } catch (caught) {
      setCorrectionNotice(caught instanceof Error ? caught.message : 'Could not send this correction.')
    } finally { setCorrectionBusy(false) }
  }

  async function loadReviewQueue(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    if (!reviewKey.trim()) return
    setReviewError('')
    try { setReviewQueue(await getPendingCatalogCorrections(reviewKey.trim())) }
    catch (caught) { setReviewError(caught instanceof Error ? caught.message : 'Could not load the catalogue review queue.') }
  }

  async function reviewCorrection(correction: CatalogCorrection, status: 'Accepted' | 'Rejected' | 'NeedsMoreInfo') {
    setReviewBusyId(correction.id); setReviewError('')
    try {
      await reviewCatalogCorrection(reviewKey.trim(), correction.id, { status, reviewerNote: reviewNotes[correction.id]?.trim() })
      setReviewQueue((current) => current.filter((item) => item.id !== correction.id))
      setReviewNotes((current) => { const next = { ...current }; delete next[correction.id]; return next })
      if (status === 'Accepted') onCatalogChanged()
    } catch (caught) { setReviewError(caught instanceof Error ? caught.message : 'Could not update this catalogue suggestion.') }
    finally { setReviewBusyId(null) }
  }

  return <section className="university-page">
    <div className="university-hero">
      <div>
        <span className="section-kicker">{t('UNIVERSITY GUIDE')}</span>
        <h2>{t('Choose a campus that fits your plans.')}</h2>
        <p>{t('Compare study options, eligibility, deadlines, estimated costs and official sources in one place.')}</p>
      </div>
      <div className="university-guide-stats">
        <div><strong>{opportunities.length}</strong><span>{t('campuses')}</span></div>
        <div><strong>{countries.length}</strong><span>{t('countries')}</span></div>
        <div><strong>€{averageGrant}</strong><span>{t('average monthly grant')}</span></div>
      </div>
    </div>

    <FeaturedCampuses />

    <div className="university-toolbar">
      <label className="search-box"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('Search university, city, or field…')} aria-label={t('Search universities')} /></label>
      <label className="university-country"><span className="sr-only">{t('Filter by country')}</span><select value={country} onChange={(event) => setCountry(event.target.value)}><option value="">{t('All countries')}</option>{countries.map((item) => <option key={item} value={item}>{t(item)}</option>)}</select></label>
      <span className="university-results">{filtered.length} {t('universities')}</span>
    </div>

    <div className="university-list">{filtered.map((item) => {
      const expanded = expandedId === item.id
      return <article className="university-card" key={item.id}>
        <div className="university-card-head">
          <UniversityPhoto key={item.university} university={item.university} />
          <div className="university-card-title"><span className={'verification ' + (item.verificationStatus === 'Verified' ? 'verified' : 'review')}><span />{t(item.verificationStatus === 'Verified' ? 'Source reviewed' : 'Needs review')}</span>
            <h3>{item.university}</h3><span className="location"><MapPin size={14} />{item.city}, {t(item.country)}</span>
          </div>
          {item.verificationStatus !== 'Verified' && <div className="catalog-caution">{t('Planning data only: verify GPA, grant, deadline, and course availability with the official source and your coordinator.')}</div>}
          <button className="university-peer-link" onClick={() => onFindPeers(item.id)}><Users size={16} /> {t('Find future students')}</button>
        </div>
        <div className="university-fields">{item.studyFields.map((field) => <span key={field}>{t(field)}</span>)}</div>
        <div className="university-facts">
          <div><small>{t('DEGREE LEVELS')}</small><strong>{item.levels.map(t).join(' · ')}</strong></div>
          <div><small>{t('MINIMUM GPA')}</small><strong>{item.minimumGpa.toFixed(1)}</strong></div>
          <div><small>{t('GRANT / MONTH')}</small><strong>€{item.monthlyGrant}</strong></div>
          <div><small>{t('EST. MONTHLY COST')}</small><strong>€{item.studentBudgetEstimate}</strong></div>
          <div><small>{t('APPLICATION DEADLINE')}</small><strong>{new Date(item.deadline).toLocaleDateString(language === 'az' ? 'az-AZ' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}</strong></div>
        </div>
        <div className="university-card-actions">
          <button type="button" className="text-button" onClick={() => setExpandedId(expanded ? null : item.id)}>{t(expanded ? 'Hide university guide' : 'University guide')}<ChevronDown size={15} className={expanded ? 'rotated' : ''} /></button>
          <a className="source-link" href={item.sourceUrl} target="_blank" rel="noreferrer">{t('Official source')} <ExternalLink size={13} /></a>
        </div>
        {expanded && <div className="university-details">
          <div><strong>{t('Study and language')}</strong><p>{item.studyFields.map(t).join(', ')}. {t('Available degree levels:')} {item.levels.map(t).join(', ')}. {t('Languages listed:')} {item.languages.map(t).join(', ')}.</p></div>
          <div><strong>{t('Budget planning')}</strong><p>{t('Estimated rent:')} €{item.monthlyRentEstimate}; {t('monthly living costs:')} €{item.monthlyLivingEstimate}; {t('estimated combined cost:')} €{item.studentBudgetEstimate}. {t('Grant coverage estimate:')} {item.grantCoveragePercent}%.</p></div>
          <div><strong>{t('Student life')}</strong><p>{item.studentExperience}</p></div>
          <div><strong>{t('Prepare to apply')}</strong><ul>{item.applicationDocuments.map((document) => <li key={document}>{document}</li>)}</ul><p className="university-note">{t('Confirm the current application route, exchange agreement and deadline with your home university.')}</p></div>
          <div className="university-reminder"><div><strong>{t('Application deadline reminder')}</strong><small>{reminders.some((reminder) => reminder.opportunityId === item.id) ? t('Email me {days} days before').replace('{days}', String(reminders.find((reminder) => reminder.opportunityId === item.id)?.daysBefore ?? 7)) : t('Get one email before this listed deadline.')}</small></div><button type="button" onClick={() => onToggleReminder(item.id)}><Bell size={14} />{t(reminders.some((reminder) => reminder.opportunityId === item.id) ? 'Remove reminder' : canSetReminder ? 'Remind me 7 days before' : 'Sign in for a reminder')}</button></div>
          <div className="catalog-correction">
            <button type="button" className="text-button" onClick={() => { setCorrectionOpenId(correctionOpenId === item.id ? null : item.id); setCorrectionNotice('') }}>{t(correctionOpenId === item.id ? 'Close correction form' : 'Suggest a catalogue correction')} <ArrowUpRight size={14} /></button>
            {correctionOpenId === item.id && (!user?.emailVerified ? <div className="correction-gate"><span>{t('Sign in and verify your email to suggest an update.')}</span><button className="text-button" type="button" onClick={onSignIn}>{t('Sign in')} <ArrowUpRight size={14} /></button></div> : <form className="correction-form" onSubmit={(event) => { void submitCorrection(event, item.id) }}>
              <label>{t('Which detail needs updating?')}<select value={correctionField} onChange={(event) => setCorrectionField(event.target.value)}>{['Deadline', 'University', 'City', 'Country', 'StudyFields', 'Levels', 'Languages', 'MinimumGpa', 'MonthlyGrant'].map((field) => <option key={field} value={field}>{t(field)}</option>)}</select></label>
              <label>{t('Correct value')}<input required maxLength={300} value={correctionValue} onChange={(event) => setCorrectionValue(event.target.value)} placeholder={t(correctionField === 'Deadline' ? 'YYYY-MM-DD' : 'Enter the verified value')} /></label>
              <label>{t('Official source URL')}<input required type="url" maxLength={500} value={correctionSourceUrl} onChange={(event) => setCorrectionSourceUrl(event.target.value)} placeholder="https://university.eu/..." /></label>
              <label>{t('Why does this need updating?')}<textarea required minLength={10} maxLength={700} rows={3} value={correctionNote} onChange={(event) => setCorrectionNote(event.target.value)} /></label>
              <small>{t('A reviewer checks your source before the catalogue changes.')}</small>
              <button className="primary-button" type="submit" disabled={correctionBusy || correctionValue.trim().length === 0}>{t(correctionBusy ? 'Sending…' : 'Send for review')} <ArrowUpRight size={14} /></button>
            </form>)}
            {correctionNotice && <p className="inline-success" role="status">{t(correctionNotice)}</p>}
          </div>
          <div><strong>{t('Housing links')}</strong><div className="housing-links">{item.accommodationLinks.map((link) => <a key={link.name} href={link.url} target="_blank" rel="noreferrer"><span>{link.name}</span><small>{link.note}</small><ExternalLink size={13} /></a>)}</div></div>
          <small className="university-reviewed">{t('Source review date:')} {new Date(item.lastVerifiedAt).toLocaleDateString(language === 'az' ? 'az-AZ' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}. {t('Estimates are for planning and may change.')}</small>
        </div>}
      </article>
    })}</div>
    {filtered.length === 0 && <div className="empty-state"><Search size={25} /><strong>{t('No universities match this search')}</strong><span>{t('Try another city, subject or country.')}</span></div>}
    <div className="university-footnote"><ArrowUpRight size={14} /><span>{t('Use these figures to shortlist campuses; your home university confirms the exchange place and eligibility.')}</span></div>
    <section className="catalog-review">
      <button className="text-button" type="button" onClick={() => setReviewOpen((current) => !current)}>{t(reviewOpen ? 'Close staff review' : 'Staff review queue')} <ArrowUpRight size={14} /></button>
      {reviewOpen && <div className="review-workspace">
        <div><strong>{t('Review catalogue suggestions')}</strong><small>{t('Enter the server review key. It stays in this tab only.')}</small></div>
        <form className="review-key-form" onSubmit={(event) => { void loadReviewQueue(event) }}><label>{t('Review key')}<input type="password" autoComplete="off" value={reviewKey} onChange={(event) => setReviewKey(event.target.value)} /></label><button className="secondary-button" type="submit" disabled={!reviewKey.trim()}>{t('Load suggestions')}</button></form>
        {reviewError && <p className="inline-error" role="alert">{t(reviewError)}</p>}
        {reviewQueue.length === 0 ? <p className="review-empty">{t('No pending suggestions are loaded.')}</p> : <div className="review-queue">{reviewQueue.map((correction) => <article className="review-item" key={correction.id}><div className="question-meta"><strong>{correction.university}</strong><small>{correction.displayName} · {new Date(correction.createdAt).toLocaleDateString()}</small></div><dl>{Object.entries(correction.fields).map(([field, value]) => <div key={field}><dt>{t(field)}</dt><dd>{value}</dd></div>)}</dl><p>{correction.note}</p>{correction.sourceUrl && <a href={correction.sourceUrl} target="_blank" rel="noreferrer">{t('Open official source')} <ExternalLink size={13} /></a>}<textarea rows={2} maxLength={500} value={reviewNotes[correction.id] ?? ''} onChange={(event) => setReviewNotes((current) => ({ ...current, [correction.id]: event.target.value }))} placeholder={t('Optional reviewer note')} /><div className="review-actions"><button type="button" onClick={() => { void reviewCorrection(correction, 'Accepted') }} disabled={reviewBusyId === correction.id || !correction.sourceUrl}>{t('Accept and update catalogue')}</button><button type="button" onClick={() => { void reviewCorrection(correction, 'NeedsMoreInfo') }} disabled={reviewBusyId === correction.id}>{t('Need more information')}</button><button type="button" onClick={() => { void reviewCorrection(correction, 'Rejected') }} disabled={reviewBusyId === correction.id}>{t('Reject')}</button></div></article>)}</div>}
      </div>}
    </section>
  </section>
}
