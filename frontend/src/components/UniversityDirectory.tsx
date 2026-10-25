import { useMemo, useState } from 'react'
import { ArrowUpRight, ChevronDown, ExternalLink, MapPin, Search, Users } from 'lucide-react'
import FeaturedCampuses from './FeaturedCampuses'
import type { ErasmusOpportunity } from '../types/erasmus'

export default function UniversityDirectory({ opportunities, onFindPeers }: {
  opportunities: ErasmusOpportunity[]
  onFindPeers: (opportunityId: number) => void
}) {
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
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

  return <section className="university-page">
    <div className="university-hero">
      <div>
        <span className="section-kicker">UNIVERSITY GUIDE</span>
        <h2>Choose a campus that fits your plans.</h2>
        <p>Compare study options, eligibility, deadlines, estimated costs and official sources in one place.</p>
      </div>
      <div className="university-guide-stats">
        <div><strong>{opportunities.length}</strong><span>campuses</span></div>
        <div><strong>{countries.length}</strong><span>countries</span></div>
        <div><strong>€{averageGrant}</strong><span>average monthly grant</span></div>
      </div>
    </div>

    <FeaturedCampuses />

    <div className="university-toolbar">
      <label className="search-box"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search university, city, or field…" aria-label="Search universities" /></label>
      <label className="university-country"><span className="sr-only">Filter by country</span><select value={country} onChange={(event) => setCountry(event.target.value)}><option value="">All countries</option>{countries.map((item) => <option key={item}>{item}</option>)}</select></label>
      <span className="university-results">{filtered.length} universities</span>
    </div>

    <div className="university-list">{filtered.map((item) => {
      const expanded = expandedId === item.id
      const initials = item.university.split(' ').map((word) => word[0]).join('').slice(0, 2)
      return <article className="university-card" key={item.id}>
        <div className="university-card-head">
          <div className="uni-monogram">{initials}</div>
          <div className="university-card-title"><span className={'verification ' + (item.verificationStatus === 'Verified' ? 'verified' : 'review')}><span />{item.verificationStatus === 'Verified' ? 'Source reviewed' : 'Needs review'}</span>
            <h3>{item.university}</h3><span className="location"><MapPin size={14} />{item.city}, {item.country}</span>
          </div>
          <button className="university-peer-link" onClick={() => onFindPeers(item.id)}><Users size={16} /> Find future students</button>
        </div>
        <div className="university-fields">{item.studyFields.map((field) => <span key={field}>{field}</span>)}</div>
        <div className="university-facts">
          <div><small>DEGREE LEVELS</small><strong>{item.levels.join(' · ')}</strong></div>
          <div><small>MINIMUM GPA</small><strong>{item.minimumGpa.toFixed(1)}</strong></div>
          <div><small>GRANT / MONTH</small><strong>€{item.monthlyGrant}</strong></div>
          <div><small>EST. MONTHLY COST</small><strong>€{item.studentBudgetEstimate}</strong></div>
          <div><small>APPLICATION DEADLINE</small><strong>{new Date(item.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}</strong></div>
        </div>
        <div className="university-card-actions">
          <button type="button" className="text-button" onClick={() => setExpandedId(expanded ? null : item.id)}>{expanded ? 'Hide university guide' : 'University guide'}<ChevronDown size={15} className={expanded ? 'rotated' : ''} /></button>
          <a className="source-link" href={item.sourceUrl} target="_blank" rel="noreferrer">Official source <ExternalLink size={13} /></a>
        </div>
        {expanded && <div className="university-details">
          <div><strong>Study and language</strong><p>{item.studyFields.join(', ')}. Available degree levels: {item.levels.join(', ')}. Languages listed: {item.languages.join(', ')}.</p></div>
          <div><strong>Budget planning</strong><p>Estimated rent: €{item.monthlyRentEstimate}; monthly living costs: €{item.monthlyLivingEstimate}; estimated combined cost: €{item.studentBudgetEstimate}. Grant coverage estimate: {item.grantCoveragePercent}%.</p></div>
          <div><strong>Student life</strong><p>{item.studentExperience}</p></div>
          <div><strong>Prepare to apply</strong><ul>{item.applicationDocuments.map((document) => <li key={document}>{document}</li>)}</ul><p className="university-note">Confirm the current application route, exchange agreement and deadline with your home university.</p></div>
          <div><strong>Housing links</strong><div className="housing-links">{item.accommodationLinks.map((link) => <a key={link.name} href={link.url} target="_blank" rel="noreferrer"><span>{link.name}</span><small>{link.note}</small><ExternalLink size={13} /></a>)}</div></div>
          <small className="university-reviewed">Source review date: {new Date(item.lastVerifiedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}. Estimates are for planning and may change.</small>
        </div>}
      </article>
    })}</div>
    {filtered.length === 0 && <div className="empty-state"><Search size={25} /><strong>No universities match this search</strong><span>Try another city, subject or country.</span></div>}
    <div className="university-footnote"><ArrowUpRight size={14} /><span>Use these figures to shortlist campuses; your home university confirms the exchange place and eligibility.</span></div>
  </section>
}
