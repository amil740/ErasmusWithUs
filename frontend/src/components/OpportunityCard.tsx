import { useState } from 'react'
import { Bookmark, ChevronDown, ExternalLink, MapPin } from 'lucide-react'
import type { ErasmusOpportunity } from '../types/erasmus'

export default function OpportunityCard({ opportunity, saved, onSave }: {
  opportunity: ErasmusOpportunity
  saved: boolean
  onSave: (id: number) => void
}) {
  const [showDetails, setShowDetails] = useState(false)
  const isVerified = opportunity.verificationStatus === 'Verified'
  const grantCovers = opportunity.grantCoveragePercent >= 100

  return <article className="opportunity-card">
    <div className="card-top">
      <span className={`verification ${isVerified ? 'verified' : 'review'}`}><span /> {isVerified ? 'Verified source' : 'Needs review'}</span>
      <button className={`save-button ${saved ? 'saved' : ''}`} onClick={() => onSave(opportunity.id)} aria-label={saved ? 'Remove from shortlist' : 'Save to shortlist'}>
        <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />
      </button>
    </div>
    <div className="uni-monogram">{opportunity.university.split(' ').map((word) => word[0]).join('').slice(0, 2)}</div>
    <h3>{opportunity.university}</h3>
    <div className="location"><MapPin size={14} /> {opportunity.city}, {opportunity.country}</div>
    <div className="field-tags">{opportunity.studyFields.slice(0, 2).map((field) => <span key={field}>{field}</span>)}</div>
    <div className="card-details">
      <div><small>MIN. GPA</small><strong>{opportunity.minimumGpa.toFixed(1)}</strong></div>
      <div><small>GRANT / MONTH</small><strong>EUR {opportunity.monthlyGrant}</strong></div>
      <div><small>DEADLINE</small><strong>{new Date(opportunity.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</strong></div>
    </div>
    <div className="cost-snapshot">
      <div><span>EST. MONTHLY TOTAL</span><strong>EUR {opportunity.studentBudgetEstimate}</strong><small>Rent + basics</small></div>
      <div className={grantCovers ? 'cost-good' : 'cost-warn'}><span>GRANT COVERS</span><strong>{opportunity.grantCoveragePercent}%</strong><small>{grantCovers ? 'Most core costs' : 'Plan extra savings'}</small></div>
    </div>
    <button className="details-toggle" type="button" onClick={() => setShowDetails((previous) => !previous)}>
      {showDetails ? 'Hide student guide' : 'See city, application & housing guide'}
      <ChevronDown size={14} className={showDetails ? 'rotated' : ''} />
    </button>
    {showDetails && <div className="student-guide">
      <div className="guide-block"><strong>Which city fits?</strong><p>{opportunity.city}: around EUR {opportunity.monthlyRentEstimate} rent plus EUR {opportunity.monthlyLivingEstimate} for food, transport, phone, and basics. This is a planning estimate, not a guaranteed quote.</p></div>
      <div className="guide-block"><strong>Does the grant cover it?</strong><p>EUR {opportunity.monthlyGrant} grant against roughly EUR {opportunity.studentBudgetEstimate} monthly costs. {grantCovers ? 'It can cover core costs if you choose shared housing.' : `Expect to add about EUR ${Math.max(0, opportunity.studentBudgetEstimate - opportunity.monthlyGrant)} or reduce costs with shared housing.`}</p></div>
      <div className="guide-block"><strong>Can your field apply?</strong><p>{opportunity.studyFields.join(', ')}. Available levels: {opportunity.levels.join(' and ')}. Check your home university agreement before applying.</p></div>
      <div className="guide-block"><strong>Common documents to prepare</strong><p>Requirements vary by university; confirm the final list with your exchange coordinator.</p><ul>{opportunity.applicationDocuments.map((document) => <li key={document}>{document}</li>)}</ul></div>
      <div className="guide-block"><strong>City context</strong><p>{opportunity.studentExperience}</p></div>
      <div className="guide-block housing-block"><strong>Affordable housing near {opportunity.city}</strong><div className="housing-links">{opportunity.accommodationLinks.map((link) => <a key={link.name} href={link.url} target="_blank" rel="noreferrer"><span>{link.name}</span><small>{link.note}</small><ExternalLink size={13} /></a>)}</div></div>
    </div>}
    <div className="source-footer">
      <a className="source-link" href={opportunity.sourceUrl} target="_blank" rel="noreferrer">View university source <ExternalLink size={13} /></a>
      <small>Last checked {new Date(opportunity.lastVerifiedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}</small>
    </div>
  </article>
}
