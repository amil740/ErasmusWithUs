import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  ArrowUpRight, Bookmark, Check, ChevronDown, Compass, ExternalLink,
  Filter, Heart, MapPin, Menu, Search, SlidersHorizontal, Sparkles, X,
} from 'lucide-react'
import './App.css'
import {
  getCurrentUser,
  getMatches,
  getOpportunities,
  loginAccount,
  registerAccount,
  requestPasswordReset,
  updateAccountSettings,
  verifyEmail,
} from './lib/api'
import type { ErasmusOpportunity, MatchResult, StudentProfile, User } from './types/erasmus'

const savedKey = 'erasmuswithus.saved-opportunities'
const studyFieldOptions = ['Computer Science', 'Software Engineering', 'Artificial Intelligence', 'Data Science', 'Cybersecurity', 'Information Systems', 'Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Chemical Engineering', 'Environmental Engineering', 'Architecture', 'Urban Planning', 'Business', 'Finance', 'Marketing', 'Economics', 'Entrepreneurship', 'Management', 'Design', 'Product Design', 'Graphic Design', 'Arts', 'Media Studies', 'Film', 'Music', 'Social Sciences', 'Psychology', 'Sociology', 'Political Science', 'International Relations', 'Law', 'Medicine', 'Nursing', 'Pharmacy', 'Life Sciences', 'Biology', 'Physics', 'Mathematics']
const degreeOptions = ['Short cycle', 'Bachelor', 'Master', 'Doctorate']
const countryCatalog = ['Finland', 'Germany', 'Netherlands', 'Sweden', 'Denmark', 'Spain', 'Portugal', 'Italy', 'Austria', 'Belgium', 'France', 'Ireland', 'Poland', 'Czechia', 'Estonia', 'Latvia', 'Lithuania', 'Slovakia', 'Slovenia', 'Croatia', 'Norway', 'Switzerland', 'Greece', 'Romania', 'Hungary', 'United Kingdom', 'Iceland', 'Luxembourg', 'Malta', 'Cyprus', 'Serbia', 'Bosnia and Herzegovina', 'Andorra', 'Bulgaria', 'Turkey', 'North Macedonia', 'Montenegro', 'Georgia', 'Armenia', 'Moldova', 'Ukraine', 'Albania']
const languageOptions = ['English', 'German', 'French', 'Spanish', 'Italian', 'Dutch', 'Portuguese', 'Czech', 'Polish', 'Swedish', 'Finnish', 'Danish', 'Norwegian', 'Estonian', 'Latvian', 'Lithuanian', 'Hungarian', 'Greek', 'Romanian', 'Croatian', 'Slovenian', 'Slovak', 'Bulgarian', 'Turkish', 'Icelandic', 'Serbian', 'Arabic', 'Chinese', 'Japanese', 'Korean']
const lifestyleOptions = ['Tech ecosystem', 'Strong grant', 'Student life', 'Safe city', 'Warm climate', 'Outdoor activities', 'Creative scene', 'Affordable living', 'Urban culture', 'Quiet campus', 'Research focus', 'International vibe', 'Nightlife', 'Beach access', 'Mountains nearby', 'Startup scene', 'Arts and culture', 'Large campus', 'Small campus', 'Public transport', 'Bike friendly', 'English friendly', 'Part-time work', 'Green city', 'Historic city', 'Modern city', 'Food culture', 'Sports clubs', 'Entrepreneurship', 'Low competition']
const budgetOptions = [300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500]

const defaultMatchProfile: StudentProfile = {
  homeUniversity: 'My university is not listed',
  intake: 'Autumn 2026/27',
  country: 'Finland',
  studyField: 'Computer Science',
  level: 'Master',
  gpa: 3.2,
  preferredCountries: ['Finland', 'Germany', 'Netherlands'],
  languages: ['English'],
  likes: ['Tech ecosystem', 'Student life', 'Safe city', 'Strong grant'],
  dislikes: ['Very cold winters', 'High living cost', 'Very isolated city'],
  budget: 500,
}

function App() {
  const [opportunities, setOpportunities] = useState<ErasmusOpportunity[]>([])
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('')
  const [level, setLevel] = useState('')
  const [saved, setSaved] = useState<number[]>(() => JSON.parse(localStorage.getItem(savedKey) ?? '[]'))
  const [activeNav, setActiveNav] = useState('Discover')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [isMatching, setIsMatching] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showMatchForm, setShowMatchForm] = useState(false)
  const [showAccountSettings, setShowAccountSettings] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [matchProfile, setMatchProfile] = useState<StudentProfile>(defaultMatchProfile)
  const [settingsProfile, setSettingsProfile] = useState<StudentProfile>(defaultMatchProfile)
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password' | 'verify-code' | null>(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [settingsMessage, setSettingsMessage] = useState('')

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    getOpportunities({ search, country, level })
      .then((data) => { if (!cancelled) setOpportunities(data) })
      .catch(() => { if (!cancelled) setError('The API is offline. Start ErasmusWithUs.Api on port 5238 and try again.') })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [search, country, level])

  useEffect(() => {
    const shouldLockScroll = showMatchForm || showAccountSettings || authMode !== null
    document.body.style.overflow = shouldLockScroll ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showMatchForm, showAccountSettings, authMode])

  useEffect(() => {
    const token = localStorage.getItem('erasmuswithus.token')
    if (!token) return

    getCurrentUser(token)
      .then((user) => {
        setCurrentUser(user)
        setSettingsProfile({
          homeUniversity: defaultMatchProfile.homeUniversity,
          intake: defaultMatchProfile.intake,
          country: user.country ?? '',
          studyField: user.studyField ?? 'Computer Science',
          level: user.level ?? 'Master',
          gpa: user.gpa ?? 3.2,
          preferredCountries: user.preferredCountries ?? [],
          languages: user.languages ?? ['English'],
          likes: defaultMatchProfile.likes,
          dislikes: defaultMatchProfile.dislikes,
          budget: defaultMatchProfile.budget,
        })
      })
      .catch(() => {
        localStorage.removeItem('erasmuswithus.token')
      })
  }, [])

  const countries = useMemo(() => Array.from(new Set([...countryCatalog, ...opportunities.map((item) => item.country)])).sort(), [opportunities])
  const visibleOpportunities = activeNav === 'Shortlist'
    ? opportunities.filter((item) => saved.includes(item.id))
    : opportunities

  function toggleSaved(id: number) {
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id]
    setSaved(next)
    localStorage.setItem(savedKey, JSON.stringify(next))
  }

  function updateMatchProfile<K extends keyof StudentProfile>(key: K, value: StudentProfile[K]) {
    setMatchProfile((previous) => ({ ...previous, [key]: value }))
  }

  function updateSettingsProfile<K extends keyof StudentProfile>(key: K, value: StudentProfile[K]) {
    setSettingsProfile((previous) => ({ ...previous, [key]: value }))
  }

  function toggleMultiChoice(target: 'preferredCountries' | 'languages' | 'likes' | 'dislikes', value: string, profileState: StudentProfile, updater: (next: StudentProfile) => void) {
    const currentValues = profileState[target] ?? []
    const nextValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value]
    updater({ ...profileState, [target]: nextValues })
  }

  async function findMatches(profileOverride?: StudentProfile) {
    setIsMatching(true)
    setError('')
    const profile = profileOverride ?? matchProfile
    const normalizedProfile: StudentProfile = {
      ...profile,
      homeUniversity: profile.homeUniversity ?? 'My university is not listed',
      intake: profile.intake ?? 'I am not sure yet',
      country: profile.country ?? '',
      studyField: profile.studyField ?? '',
      level: profile.level ?? '',
      gpa: Number(profile.gpa ?? 0),
      preferredCountries: profile.preferredCountries ?? [],
      languages: profile.languages ?? [],
      likes: profile.likes ?? [],
      dislikes: profile.dislikes ?? [],
      budget: Number(profile.budget ?? 0),
    }
    try {
      const result = await getMatches(normalizedProfile)
      setMatches(result)
      setShowMatchForm(false)
      setTimeout(() => document.getElementById('match-preview')?.scrollIntoView({ behavior: 'smooth' }), 80)
    }
    catch {
      setError('Matching is unavailable while the API is offline.')
    }
    finally { setIsMatching(false) }
  }

  function handleNav(label: string) {
    setActiveNav(label)
    setError('')
    if (label === 'Find my match') {
      setShowMatchForm(true)
      setTimeout(() => document.getElementById('match-preview')?.scrollIntoView({ behavior: 'smooth' }), 50)
    } else if (label === 'Shortlist') {
      setTimeout(() => document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' }), 50)
    } else if (label === 'Discover') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthMessage('')

    try {
      const response = authMode === 'register'
        ? await registerAccount({ email: authEmail, password: authPassword, displayName: authName })
        : await loginAccount({ email: authEmail, password: authPassword })

      localStorage.setItem('erasmuswithus.token', response.token)
      setCurrentUser(response.user)
      if (response.verificationRequired) {
        setAuthMessage(`We sent a six-letter verification code to ${response.user.email}.${response.verificationCode ? ` Development code: ${response.verificationCode}` : ''}`)
        setAuthPassword('')
        setAuthMode('verify-code')
        return
      }
      setAuthMessage(`Welcome, ${response.user.displayName}. Your account is ready.`)
      setAuthPassword('')
      setAuthMode(null)
    } catch (requestError) {
      setAuthMessage(requestError instanceof Error ? requestError.message : 'Could not complete the request.')
    }
  }

  async function handleForgotPassword() {
    try {
      const response = await requestPasswordReset({ email: authEmail })
      setAuthMessage(`${response.message}${response.token ? ` Token: ${response.token}` : ''}`)
    } catch (requestError) {
      setAuthMessage(requestError instanceof Error ? requestError.message : 'Could not request a password reset.')
    }
  }

  async function handleVerifyEmailToken() {
    if (!authEmail || !authPassword) {
      setAuthMessage('Please provide your email and the verification token shown by the server.')
      return
    }

    try {
      const response = await verifyEmail({ email: authEmail, token: authPassword })
      setAuthMessage(response.message)
      setAuthPassword('')
      setAuthMode(null)
    } catch (requestError) {
      setAuthMessage(requestError instanceof Error ? requestError.message : 'Verification failed.')
    }
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSettingsMessage('')

    const token = localStorage.getItem('erasmuswithus.token')
    if (!token) {
      setSettingsMessage('Sign in to save your account settings.')
      return
    }

    try {
      const updatedUser = await updateAccountSettings(token, {
        country: settingsProfile.country || null,
        studyField: settingsProfile.studyField || null,
        level: settingsProfile.level || null,
        gpa: Number(settingsProfile.gpa ?? 0),
        preferredCountries: settingsProfile.preferredCountries ?? [],
        languages: settingsProfile.languages ?? [],
      })
      setCurrentUser(updatedUser)
      setSettingsMessage('Account settings saved successfully.')
    } catch (requestError) {
      setSettingsMessage(requestError instanceof Error ? requestError.message : 'Could not save your settings.')
    }
  }

  return (
    <div className="app-shell">
      {mobileMenuOpen && <button className="nav-backdrop" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand"><span className="brand-mark"><Compass size={19} /></span><span>Erasmus<span className="brand-light">WithUs</span></span></div>
        <div className="sidebar-label">Workspace</div>
        <nav className="nav-list">
          {[
            ['Discover', Compass], ['Find my match', Sparkles], ['Compare', SlidersHorizontal], ['Shortlist', Bookmark], ['Planner', Check],
          ].map(([label, Icon]) => (
            <button className={`nav-item ${activeNav === label ? 'active' : ''}`} key={label as string} onClick={() => { handleNav(label as string); setMobileMenuOpen(false) }}>
              <Icon size={18} /><span>{label as string}</span>{label === 'Shortlist' && saved.length > 0 && <b>{saved.length}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-label">Your journey</div>
          <div className="journey-card"><div className="journey-top"><span>Profile progress</span><strong>35%</strong></div><div className="progress"><i style={{ width: '35%' }} /></div><p>Complete your profile to unlock better matches.</p><button onClick={() => setShowMatchForm(true)}>Improve profile <ArrowUpRight size={14} /></button></div>
          <button className="user-chip" type="button" onClick={() => currentUser ? setShowAccountSettings(true) : setAuthMode('login')}>
            <span className="avatar">{currentUser ? currentUser.displayName.slice(0, 2).toUpperCase() : 'AM'}</span>
            <span><strong>{currentUser ? currentUser.displayName : 'Guest explorer'}</strong><small>{currentUser ? 'Account settings' : 'Set up account'}</small></span>
            <ChevronDown size={15} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMobileMenuOpen((previous) => !previous)}><Menu size={20} /></button>
          <div className="breadcrumb">ErasmusWithUs <span>/</span> <strong>{activeNav}</strong></div>
          <div className="top-actions">
            <button className="language">EN <ChevronDown size={14} /></button>
            <button className="icon-button" aria-label="Saved opportunities"><Heart size={18} /></button>
            <button className="profile-button" onClick={() => currentUser ? setShowAccountSettings(true) : setAuthMode('login')}>
              {currentUser ? 'Account settings' : 'Sign in'} <ArrowUpRight size={15} />
            </button>
          </div>
        </header>

        <section className="intro">
          <div>
            <div className="eyebrow"><span /> 2026 / 27 exchange catalogue</div>
            <h1>Find the place<br /><em>you'll grow into.</em></h1>
            <p>Explore verified Erasmus opportunities across Europe, then find the one that fits your degree, language, budget, and ambitions.</p>
          </div>
          <div className="intro-note">
            <span className="note-icon"><Sparkles size={18} /></span>
            <div>
              <strong>Personalised matching</strong>
              <small>Answer a few quick questions and get the best-fit destinations for your profile.</small>
            </div>
            <button onClick={() => setShowMatchForm(true)} disabled={isMatching}>{isMatching ? 'Matching...' : 'Find my match'} <ArrowUpRight size={15} /></button>
          </div>
        </section>

        <section className="stats-strip">
          <div><strong>{opportunities.length || '—'}</strong><span>destinations indexed</span></div>
          <div><strong>{countries.length}</strong><span>countries indexed</span></div>
          <div><strong>2.8k</strong><span>students exploring</span></div>
          <div className="verified-legend"><span className="status-dot" /> Official sources checked daily</div>
        </section>

        {activeNav === 'Compare' && <section className="workspace-panel"><span className="section-kicker">COMPARE DESTINATIONS</span><h2>See your saved choices side by side.</h2><p>Save two or more universities from the cards below, then compare their GPA, grant, deadline, and verification status here.</p><button className="primary-button" onClick={() => handleNav('Shortlist')}>Open shortlist <ArrowUpRight size={15} /></button></section>}
        {activeNav === 'Planner' && <section className="workspace-panel"><span className="section-kicker">APPLICATION PLANNER</span><h2>Turn a destination into a plan.</h2><p>Your application checklist will live here: coordinator contact, transcript, language certificate, Learning Agreement, housing, and travel.</p><div className="planner-preview"><span><Check size={15} /> Review university requirements</span><span><Check size={15} /> Prepare transcript and language proof</span><span><Check size={15} /> Add your application deadline</span></div></section>}

        <section className="discovery" id="opportunities">
          <div className="section-heading">
            <div>
              <span className="section-kicker">{activeNav === 'Shortlist' ? 'YOUR SHORTLIST' : 'DISCOVER OPPORTUNITIES'}</span>
              <h2>{activeNav === 'Shortlist' ? 'Your saved destinations.' : 'Where could you go?'}</h2>
            </div>
            <button className="text-button">View all destinations <ArrowUpRight size={15} /></button>
          </div>

          <div className="search-row">
            <label className="search-box"><Search size={19} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search university, city, or subject..." /><kbd>Cmd K</kbd></label>
            <button className="filter-button" onClick={() => setShowFilters(!showFilters)}><Filter size={17} /> Filters <span>{[country, level].filter(Boolean).length || ''}</span></button>
            <button className="sort-button">Recommended <ChevronDown size={16} /></button>
          </div>

          {showFilters && <div className="filter-panel"><label>Country<select value={country} onChange={(event) => setCountry(event.target.value)}><option value="">All countries</option>{countries.map((item) => <option key={item}>{item}</option>)}</select></label><label>Degree level<select value={level} onChange={(event) => setLevel(event.target.value)}><option value="">All levels</option><option>Bachelor</option><option>Master</option></select></label><button onClick={() => { setCountry(''); setLevel('') }}>Clear filters <X size={14} /></button></div>}
          {error && <div className="error-banner"><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss error"><X size={16} /></button></div>}
          <div className="results-meta"><span>{isLoading ? 'Loading destinations...' : `${visibleOpportunities.length} opportunities`}</span><span className="results-meta-right"><span className="status-dot" /> Verified information includes source and last checked date</span></div>
          <div className="opportunity-grid">{isLoading ? [...Array(4)].map((_, index) => <div className="opportunity-card skeleton" key={index} />) : visibleOpportunities.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} saved={saved.includes(opportunity.id)} onSave={toggleSaved} />)}</div>
          {!isLoading && visibleOpportunities.length === 0 && <div className="empty-state"><Compass size={28} /><strong>{activeNav === 'Shortlist' ? 'Your shortlist is empty' : 'No destinations found'}</strong><span>{activeNav === 'Shortlist' ? 'Use the bookmark icon to save a destination.' : 'Try clearing a filter or searching for another city.'}</span></div>}
        </section>

        <section className="match-preview" id="match-preview">
          <div className="match-copy">
            <span className="section-kicker">A SHORTCUT TO THE RIGHT FIT</span>
            <h2>Your next chapter<br /><em>is closer than you think.</em></h2>
            <p>Our matching engine weighs your field, GPA, language, budget, and what you really enjoy so the suggestions become personal rather than generic.</p>
            <button className="primary-button" onClick={() => setShowMatchForm(true)} disabled={isMatching}>{isMatching ? 'Calculating...' : 'Build my shortlist'} <ArrowUpRight size={16} /></button>
          </div>
          <div className="match-visual"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="match-center"><Sparkles size={23} /><strong>{matches.length ? `${matches[0].score}%` : '—'}</strong><span>best match</span></div><span className="city-label city-a">Helsinki</span><span className="city-label city-b">Berlin</span><span className="city-label city-c">Lisbon</span></div>
        </section>

        {matches.length > 0 && <section className="match-results"><div><span className="section-kicker">YOUR MATCH RESULTS</span><h2>Start with these.</h2><p className="match-disclaimer">The score explains fit, not eligibility. Your home university coordinator must confirm the bilateral agreement and nomination.</p></div><div className="match-result-list">{matches.slice(0, 3).map((match) => <article key={match.opportunity.id}><span className="match-score">{match.score}%</span><div><strong>{match.opportunity.university}</strong><small>{match.opportunity.city}, {match.opportunity.country} · {match.reasons[0] ?? 'Fits your profile'}</small><div className="match-breakdown">{match.breakdown.filter((factor) => factor.points > 0).slice(0, 4).map((factor) => <span key={factor.name}>{factor.name} +{factor.points}</span>)}</div></div><button onClick={() => toggleSaved(match.opportunity.id)} aria-label="Save match"><Bookmark size={17} fill={saved.includes(match.opportunity.id) ? 'currentColor' : 'none'} /></button></article>)}</div></section>}
      </main>

      {showMatchForm && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowMatchForm(false) }}><section className="auth-modal match-modal" role="dialog" aria-modal="true" aria-labelledby="match-title"><button className="modal-close" onClick={() => setShowMatchForm(false)} aria-label="Close"><X size={18} /></button><span className="section-kicker">FIND MY MATCH</span><h2 id="match-title">Tell us what suits you.</h2><p>Pick your preferences below to get a personalised shortlist without typing free-form answers.</p><form className="match-form" onSubmit={(event) => { event.preventDefault(); void findMatches(matchProfile) }}><div className="match-grid"><label>Home country<select value={matchProfile.country} onChange={(event) => updateMatchProfile('country', event.target.value)}><option value="">Select country</option>{countryCatalog.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label>Study field<select value={matchProfile.studyField} onChange={(event) => updateMatchProfile('studyField', event.target.value)}>{studyFieldOptions.map((item) => <option key={item}>{item}</option>)}</select></label><label>Degree level<select value={matchProfile.level} onChange={(event) => updateMatchProfile('level', event.target.value)}>{degreeOptions.map((item) => <option key={item}>{item}</option>)}</select></label><label>GPA<select value={String(matchProfile.gpa)} onChange={(event) => updateMatchProfile('gpa', Number(event.target.value))}>{[2.0, 2.5, 2.7, 3.0, 3.2, 3.5, 3.7, 4.0].map((value) => <option key={value} value={String(value)}>{value.toFixed(1)}</option>)}</select></label><label>Monthly budget (EUR)<select value={String(matchProfile.budget ?? 0)} onChange={(event) => updateMatchProfile('budget', Number(event.target.value))}>{budgetOptions.map((value) => <option key={value} value={String(value)}>{value} EUR</option>)}</select></label></div><label>Preferred countries<div className="chip-grid">{countries.map((countryName) => <button type="button" key={countryName} className={`chip ${matchProfile.preferredCountries.includes(countryName) ? 'active' : ''}`} onClick={() => toggleMultiChoice('preferredCountries', countryName, matchProfile, (next) => setMatchProfile(next))}>{countryName}</button>)}</div></label><label>Languages<div className="chip-grid">{languageOptions.map((language) => <button type="button" key={language} className={`chip ${matchProfile.languages.includes(language) ? 'active' : ''}`} onClick={() => toggleMultiChoice('languages', language, matchProfile, (next) => setMatchProfile(next))}>{language}</button>)}</div></label><label>What you like<div className="chip-grid">{lifestyleOptions.map((item) => <button type="button" key={item} className={`chip ${matchProfile.likes?.includes(item) ? 'active' : ''}`} onClick={() => toggleMultiChoice('likes', item, matchProfile, (next) => setMatchProfile(next))}>{item}</button>)}</div></label><label>What you dislike<div className="chip-grid">{['Very cold winters', 'High living cost', 'Very isolated city', 'Low grant', 'Fast-paced city', 'Limited international community', 'Heavy bureaucracy', 'Remote campus'].map((item) => <button type="button" key={item} className={`chip ${matchProfile.dislikes?.includes(item) ? 'active' : ''}`} onClick={() => toggleMultiChoice('dislikes', item, matchProfile, (next) => setMatchProfile(next))}>{item}</button>)}</div></label><button type="submit" className="primary-button auth-submit" disabled={isMatching}>{isMatching ? 'Matching...' : 'Find best fit'} <ArrowUpRight size={15} /></button></form></section></div>}

      {showAccountSettings && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAccountSettings(false) }}><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title"><button className="modal-close" onClick={() => setShowAccountSettings(false)} aria-label="Close"><X size={18} /></button><span className="section-kicker">ACCOUNT SETTINGS</span><h2 id="settings-title">Update your Erasmus profile.</h2><p>Keep your study interests, preferred countries, and language profile aligned with your ideal exchange plan.</p><form onSubmit={saveSettings}><div className="match-grid"><label>Country<select value={settingsProfile.country} onChange={(event) => updateSettingsProfile('country', event.target.value)}><option value="">Select country</option>{countryCatalog.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label>Study field<select value={settingsProfile.studyField} onChange={(event) => updateSettingsProfile('studyField', event.target.value)}>{studyFieldOptions.map((item) => <option key={item}>{item}</option>)}</select></label><label>Degree level<select value={settingsProfile.level} onChange={(event) => updateSettingsProfile('level', event.target.value)}>{degreeOptions.map((item) => <option key={item}>{item}</option>)}</select></label><label>GPA<select value={String(settingsProfile.gpa)} onChange={(event) => updateSettingsProfile('gpa', Number(event.target.value))}>{[2.0, 2.5, 2.7, 3.0, 3.2, 3.5, 3.7, 4.0].map((value) => <option key={value} value={String(value)}>{value.toFixed(1)}</option>)}</select></label></div><label>Preferred countries<div className="chip-grid">{countries.map((countryName) => <button type="button" key={countryName} className={`chip ${settingsProfile.preferredCountries.includes(countryName) ? 'active' : ''}`} onClick={() => toggleMultiChoice('preferredCountries', countryName, settingsProfile, (next) => setSettingsProfile(next))}>{countryName}</button>)}</div></label><label>Languages<div className="chip-grid">{languageOptions.map((language) => <button type="button" key={language} className={`chip ${settingsProfile.languages.includes(language) ? 'active' : ''}`} onClick={() => toggleMultiChoice('languages', language, settingsProfile, (next) => setSettingsProfile(next))}>{language}</button>)}</div></label><button className="primary-button auth-submit" type="submit">Save settings <ArrowUpRight size={15} /></button>{settingsMessage && <div className="auth-message">{settingsMessage}</div>}</form></section></div>}

      {authMode && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && authMode !== 'verify-code') setAuthMode(null) }}><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="modal-close" onClick={() => { if (authMode !== 'verify-code') setAuthMode(null) }} aria-label="Close"><X size={18} /></button><span className="section-kicker">ERASMUSWITHUS ACCOUNT</span><h2 id="auth-title">{authMode === 'login' ? 'Welcome back.' : authMode === 'register' ? 'Start your journey.' : authMode === 'forgot-password' ? 'Reset your password.' : 'Check your email.'}</h2><p>{authMode === 'login' || authMode === 'register' ? 'Save destinations, build your profile, and keep your Erasmus plan in one place.' : authMode === 'verify-code' ? 'Enter the six-letter code we sent to your email before continuing.' : 'Request a secure password reset link for your account.'}</p>{authMode === 'login' || authMode === 'register' ? <form onSubmit={submitAuth}>{authMode === 'register' && <label>Name<input required value={authName} onChange={(event) => setAuthName(event.target.value)} placeholder="Your name" /></label>}<label>Email<input required type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="you@example.com" /></label><label>Password<input required minLength={8} type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="At least 8 characters" /></label><button className="primary-button auth-submit" type="submit">{authMode === 'login' ? 'Sign in' : 'Create account'} <ArrowUpRight size={15} /></button></form> : authMode === 'forgot-password' ? <form onSubmit={(event) => { event.preventDefault(); void handleForgotPassword() }}><label>Email<input required type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="you@example.com" /></label><button className="primary-button auth-submit" type="submit">Send reset link <ArrowUpRight size={15} /></button></form> : <form onSubmit={(event) => { event.preventDefault(); void handleVerifyEmailToken() }}><label>Six-letter verification code<input required maxLength={6} autoCapitalize="characters" value={authPassword} onChange={(event) => setAuthPassword(event.target.value.toUpperCase())} placeholder="ABCDEF" /></label><button className="primary-button auth-submit" type="submit">Verify and continue <ArrowUpRight size={15} /></button></form>}{authMessage && <div className="auth-message">{authMessage}</div>}{authMode !== 'verify-code' && <div className="auth-actions">{authMode === 'login' || authMode === 'register' ? <><button className="switch-auth" type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthMessage('') }}>{authMode === 'login' ? 'Need an account? Create one' : 'Already have an account? Sign in'}</button><button className="switch-auth" type="button" onClick={() => { setAuthMode('forgot-password'); setAuthMessage('') }}>Forgot password?</button></> : <button className="switch-auth" type="button" onClick={() => { setAuthMode('login'); setAuthMessage('') }}>Back to sign in</button>}</div>}</section></div>}
    </div>
  )
}

function OpportunityCard({ opportunity, saved, onSave }: { opportunity: ErasmusOpportunity; saved: boolean; onSave: (id: number) => void }) {
  const [showDetails, setShowDetails] = useState(false)
  const isVerified = opportunity.verificationStatus === 'Verified'
  const grantCovers = opportunity.grantCoveragePercent >= 100

  return <article className="opportunity-card">
    <div className="card-top"><span className={`verification ${isVerified ? 'verified' : 'review'}`}><span /> {isVerified ? 'Verified source' : 'Needs review'}</span><button className={`save-button ${saved ? 'saved' : ''}`} onClick={() => onSave(opportunity.id)} aria-label={saved ? 'Remove from shortlist' : 'Save to shortlist'}><Bookmark size={17} fill={saved ? 'currentColor' : 'none'} /></button></div>
    <div className="uni-monogram">{opportunity.university.split(' ').map((word) => word[0]).join('').slice(0, 2)}</div><h3>{opportunity.university}</h3><div className="location"><MapPin size={14} /> {opportunity.city}, {opportunity.country}</div>
    <div className="field-tags">{opportunity.studyFields.slice(0, 2).map((field) => <span key={field}>{field}</span>)}</div>
    <div className="card-details"><div><small>MIN. GPA</small><strong>{opportunity.minimumGpa.toFixed(1)}</strong></div><div><small>GRANT / MONTH</small><strong>EUR {opportunity.monthlyGrant}</strong></div><div><small>DEADLINE</small><strong>{new Date(opportunity.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</strong></div></div>
    <div className="cost-snapshot"><div><span>EST. MONTHLY TOTAL</span><strong>EUR {opportunity.studentBudgetEstimate}</strong><small>Rent + basics</small></div><div className={grantCovers ? 'cost-good' : 'cost-warn'}><span>GRANT COVERS</span><strong>{opportunity.grantCoveragePercent}%</strong><small>{grantCovers ? 'Most core costs' : 'Plan extra savings'}</small></div></div>
    <button className="details-toggle" type="button" onClick={() => setShowDetails((previous) => !previous)}>{showDetails ? 'Hide student guide' : 'See city, application & housing guide'} <ChevronDown size={14} className={showDetails ? 'rotated' : ''} /></button>
    {showDetails && <div className="student-guide">
      <div className="guide-block"><strong>Which city fits?</strong><p>{opportunity.city}: around EUR {opportunity.monthlyRentEstimate} rent plus EUR {opportunity.monthlyLivingEstimate} for food, transport, phone, and basics. This is a planning estimate, not a guaranteed quote.</p></div>
      <div className="guide-block"><strong>Does the grant cover it?</strong><p>EUR {opportunity.monthlyGrant} grant against roughly EUR {opportunity.studentBudgetEstimate} monthly costs. {grantCovers ? 'It can cover core costs if you choose shared housing.' : 'Expect to add about EUR ' + Math.max(0, opportunity.studentBudgetEstimate - opportunity.monthlyGrant) + ' or reduce costs with shared housing.'}</p></div>
      <div className="guide-block"><strong>Can your field apply?</strong><p>{opportunity.studyFields.join(', ')}. Available levels: {opportunity.levels.join(' and ')}. Check your home university agreement before applying.</p></div>
      <div className="guide-block"><strong>Application checklist</strong><ul>{opportunity.applicationDocuments.map((document) => <li key={document}>{document}</li>)}</ul></div>
      <div className="guide-block"><strong>What students often say</strong><p>{opportunity.studentExperience}</p></div>
      <div className="guide-block housing-block"><strong>Affordable housing near {opportunity.city}</strong><div className="housing-links">{opportunity.accommodationLinks.map((link) => <a key={link.name} href={link.url} target="_blank" rel="noreferrer"><span>{link.name}</span><small>{link.note}</small><ExternalLink size={13} /></a>)}</div></div>
    </div>}
    <a className="source-link" href={opportunity.sourceUrl} target="_blank" rel="noreferrer">View official university source <ExternalLink size={13} /></a>
  </article>
}

export default App
