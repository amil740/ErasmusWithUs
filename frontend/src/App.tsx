import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import {
  ArrowUpRight, Bookmark, Building2, Check, ChevronDown, Compass,
  Filter, Heart, Menu, Search, SlidersHorizontal, Sparkles, UserRound, Users, X,
} from 'lucide-react'
import './App.css'
import CommunityPanel from './components/CommunityPanel'
import OpportunityCard from './components/OpportunityCard'
import { ComparePanel, PlannerPanel } from './components/WorkspacePanels'
import UniversityDirectory from './components/UniversityDirectory'
import {
  getCurrentUser,
  getMatches,
  getOpportunities,
  loginAccount,
  registerAccount,
  requestPasswordReset,
  requestEmailVerification,
  resetPassword,
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
const plannerTasks = [
  'Review exchange requirements with your coordinator',
  'Prepare transcript and language certificate',
  'Submit the Learning Agreement and application',
  'Arrange accommodation, insurance, and travel',
]

function readSavedIds(): number[] {
  try {
    const stored = JSON.parse(localStorage.getItem(savedKey) ?? '[]') as unknown
    return Array.isArray(stored) ? stored.filter((id): id is number => Number.isSafeInteger(id) && id > 0) : []
  } catch {
    return []
  }
}

function readPlannerTasks(): string[] {
  try {
    const stored = JSON.parse(localStorage.getItem('erasmuswithus.planner-tasks') ?? '[]') as unknown
    return Array.isArray(stored) ? stored.filter((task): task is string => typeof task === 'string' && plannerTasks.includes(task)) : []
  } catch {
    return []
  }
}

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

function profileFromUser(user: User): StudentProfile {
  return {
    ...defaultMatchProfile,
    homeUniversity: user.homeUniversity ?? '',
    intake: user.intake ?? defaultMatchProfile.intake,
    country: user.country ?? '',
    studyField: user.studyField ?? defaultMatchProfile.studyField,
    level: user.level ?? defaultMatchProfile.level,
    gpa: user.gpa ?? defaultMatchProfile.gpa,
    preferredCountries: user.preferredCountries ?? [],
    languages: user.languages ?? ['English'],
  }
}

function getDataUrlByteLength(dataUrl: string) {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
  return Math.floor(base64.length * 3 / 4) - padding
}

function App() {
  const [opportunities, setOpportunities] = useState<ErasmusOpportunity[]>([])
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('')
  const [level, setLevel] = useState('')
  const [saved, setSaved] = useState<number[]>(readSavedIds)
  const [activeNav, setActiveNav] = useState('Discover')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [isMatching, setIsMatching] = useState(false)
  const [sortMode, setSortMode] = useState<'recommended' | 'grant' | 'deadline'>('recommended')
  const [completedPlannerTasks, setCompletedPlannerTasks] = useState<string[]>(readPlannerTasks)
  const searchInput = useRef<HTMLInputElement>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showMatchForm, setShowMatchForm] = useState(false)
  const [showAccountSettings, setShowAccountSettings] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [matchProfile, setMatchProfile] = useState<StudentProfile>(defaultMatchProfile)
  const [settingsProfile, setSettingsProfile] = useState<StudentProfile>(defaultMatchProfile)
  const [accountDisplayName, setAccountDisplayName] = useState('')
  const [accountBio, setAccountBio] = useState('')
  const [communityVisible, setCommunityVisible] = useState(false)
  const [profilePhotoDataUrl, setProfilePhotoDataUrl] = useState<string | null>(null)
  const [profilePhotoDirty, setProfilePhotoDirty] = useState(false)
  const [removeProfilePhoto, setRemoveProfilePhoto] = useState(false)
  const [communityOpportunityId, setCommunityOpportunityId] = useState<number | undefined>()
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-code' | null>(null)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authNewPassword, setAuthNewPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [settingsMessage, setSettingsMessage] = useState('')

  function hydrateAccount(user: User) {
    const profile = profileFromUser(user)
    setSettingsProfile(profile)
    setMatchProfile(profile)
    setAccountDisplayName(user.displayName)
    setAccountBio(user.bio ?? '')
    setCommunityVisible(user.communityVisible ?? false)
    setProfilePhotoDataUrl(user.profilePhotoDataUrl ?? null)
    setProfilePhotoDirty(false)
    setRemoveProfilePhoto(false)
  }

  useEffect(() => {
    let cancelled = false
    getOpportunities({})
      .then((data) => { if (!cancelled) setOpportunities(data) })
      .catch(() => { if (!cancelled) setError('The API is offline. Start ErasmusWithUs.Api on port 5238 and try again.') })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const shouldLockScroll = showMatchForm || showAccountSettings || authMode !== null
    document.body.style.overflow = shouldLockScroll ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showMatchForm, showAccountSettings, authMode])

  useEffect(() => {
    function handleSearchShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInput.current?.focus()
      }
    }

    window.addEventListener('keydown', handleSearchShortcut)
    return () => window.removeEventListener('keydown', handleSearchShortcut)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('erasmuswithus.token')
    if (!token) return

    getCurrentUser(token)
      .then((user) => {
        setCurrentUser(user)
        hydrateAccount(user)
      })
      .catch(() => {
        localStorage.removeItem('erasmuswithus.token')
      })
  }, [])

  const countries = useMemo(() => Array.from(new Set([...countryCatalog, ...opportunities.map((item) => item.country)])).sort(), [opportunities])
  const visibleOpportunities = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    const filtered = opportunities.filter((item) => {
      const matchesSearch = !query || [item.university, item.city, ...item.studyFields]
        .some((value) => value.toLocaleLowerCase().includes(query))
      const matchesCountry = !country || item.country.toLocaleLowerCase() === country.toLocaleLowerCase()
      const matchesLevel = !level || item.levels.some((itemLevel) => itemLevel.toLocaleLowerCase() === level.toLocaleLowerCase())
      return matchesSearch && matchesCountry && matchesLevel && (activeNav !== 'Shortlist' || saved.includes(item.id))
    })

    if (sortMode === 'grant') return filtered.sort((a, b) => b.monthlyGrant - a.monthlyGrant)
    if (sortMode === 'deadline') return filtered.sort((a, b) => Date.parse(a.deadline) - Date.parse(b.deadline))
    return filtered
  }, [activeNav, country, level, opportunities, saved, search, sortMode])

  const savedOpportunities = useMemo(() => opportunities.filter((item) => saved.includes(item.id)), [opportunities, saved])
  const showCatalog = ['Discover', 'Shortlist', 'Find my match'].includes(activeNav)
  const profileCompletionFields = currentUser ? [
    currentUser.homeUniversity,
    currentUser.country,
    currentUser.studyField,
    currentUser.level,
    currentUser.intake,
    currentUser.bio,
    currentUser.preferredCountries.length > 0 ? 'set' : '',
    currentUser.languages.length > 0 ? 'set' : '',
  ] : []
  const profileProgress = Math.round(profileCompletionFields.filter((value) => Boolean(value?.trim())).length / 8 * 100)

  function toggleSaved(id: number) {
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id]
    setSaved(next)
    localStorage.setItem(savedKey, JSON.stringify(next))
  }

  function togglePlannerTask(task: string) {
    const next = completedPlannerTasks.includes(task)
      ? completedPlannerTasks.filter((item) => item !== task)
      : [...completedPlannerTasks, task]
    setCompletedPlannerTasks(next)
    localStorage.setItem('erasmuswithus.planner-tasks', JSON.stringify(next))
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
    } else if (label === 'My account') {
      if (currentUser?.emailVerified) setShowAccountSettings(true)
      else setAuthMode(currentUser ? 'verify-code' : 'login')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (label === 'Shortlist') {
      setTimeout(() => document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' }), 50)
    } else if (label === 'Discover') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
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
      hydrateAccount(response.user)
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
      setAuthMode('reset-password')
    } catch (requestError) {
      setAuthMessage(requestError instanceof Error ? requestError.message : 'Could not request a password reset.')
    }
  }

  async function handleResetPassword() {
    if (!authEmail || !authPassword || authNewPassword.length < 8) {
      setAuthMessage('Enter the reset code and a new password with at least 8 characters.')
      return
    }

    try {
      const response = await resetPassword({ email: authEmail, token: authPassword, newPassword: authNewPassword })
      setAuthPassword('')
      setAuthNewPassword('')
      setAuthMode('login')
      setAuthMessage(`${response.message} You can now sign in.`)
    } catch (requestError) {
      setAuthMessage(requestError instanceof Error ? requestError.message : 'Could not reset your password.')
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
      setCurrentUser((user) => user ? { ...user, emailVerified: true } : user)
      setAuthPassword('')
      setAuthMode(null)
    } catch (requestError) {
      setAuthMessage(requestError instanceof Error ? requestError.message : 'Verification failed.')
    }
  }

  async function handleResendVerificationCode() {
    if (!authEmail) {
      setAuthMessage('Enter your email address first.')
      return
    }

    try {
      const response = await requestEmailVerification({ email: authEmail })
      setAuthMessage(response.message + (response.token ? ' Development code: ' + response.token : ''))
    } catch (requestError) {
      setAuthMessage(requestError instanceof Error ? requestError.message : 'Could not resend the verification code.')
    }
  }

  async function handleProfilePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 4_000_000) {
      setSettingsMessage('Choose an image file smaller than 4 MB.')
      return
    }

    try {
      const bitmap = await createImageBitmap(file)
      if (bitmap.width > 8000 || bitmap.height > 8000) {
        bitmap.close()
        setSettingsMessage('Choose a smaller image (maximum 8,000 pixels on each side).')
        return
      }
      const scale = Math.min(1, 320 / Math.max(bitmap.width, bitmap.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(bitmap.width * scale))
      canvas.height = Math.max(1, Math.round(bitmap.height * scale))
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Could not prepare this image.')
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      bitmap.close()
      let quality = 0.72
      let photo = canvas.toDataURL('image/jpeg', quality)
      while (getDataUrlByteLength(photo) > 90_000 && quality > 0.4) {
        quality = Math.max(0.4, quality - 0.08)
        photo = canvas.toDataURL('image/jpeg', quality)
      }
      if (getDataUrlByteLength(photo) > 90_000) throw new Error('Choose a smaller or simpler image.')
      setProfilePhotoDataUrl(photo)
      setProfilePhotoDirty(true)
      setRemoveProfilePhoto(false)
      setSettingsMessage('')
    } catch (photoError) {
      setSettingsMessage(photoError instanceof Error ? photoError.message : 'Could not read this image.')
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

    setIsSavingSettings(true)
    try {
      const updatedUser = await updateAccountSettings(token, {
        displayName: accountDisplayName.trim(),
        country: settingsProfile.country || null,
        studyField: settingsProfile.studyField || null,
        level: settingsProfile.level || null,
        gpa: Number(settingsProfile.gpa ?? 0),
        preferredCountries: settingsProfile.preferredCountries ?? [],
        languages: settingsProfile.languages ?? [],
        homeUniversity: settingsProfile.homeUniversity || null,
        intake: settingsProfile.intake || null,
        bio: accountBio.trim() || null,
        communityVisible,
        profilePhotoDataUrl: profilePhotoDirty ? profilePhotoDataUrl : undefined,
        removeProfilePhoto,
      })
      setCurrentUser(updatedUser)
      hydrateAccount(updatedUser)
      setSettingsMessage('Account settings saved successfully.')
    } catch (requestError) {
      setSettingsMessage(requestError instanceof Error ? requestError.message : 'Could not save your settings.')
    } finally {
      setIsSavingSettings(false)
    }
  }

  return (
    <div className="app-shell">
      {mobileMenuOpen && <button className="nav-backdrop" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand"><img className="brand-logo" src="/logo.svg" alt="Erasmus With Us" /></div>
        <div className="sidebar-label">Workspace</div>
        <nav className="nav-list">
          {[
            ['Discover', Compass], ['Universities', Building2], ['Find my match', Sparkles],
            ['Community', Users], ['Compare', SlidersHorizontal], ['Shortlist', Bookmark],
            ['Planner', Check], ['My account', UserRound],
          ].map(([label, Icon]) => (
            <button className={`nav-item ${activeNav === label ? 'active' : ''}`} key={label as string} onClick={() => { handleNav(label as string); setMobileMenuOpen(false) }}>
              <Icon size={18} /><span>{label as string}</span>{label === 'Shortlist' && saved.length > 0 && <b>{saved.length}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-label">Your journey</div>
          <div className="journey-card"><div className="journey-top"><span>Profile progress</span><strong>{profileProgress}%</strong></div><div className="progress"><i style={{ width: profileProgress + '%' }} /></div><p>{profileProgress === 100 ? 'Your Erasmus profile is ready.' : currentUser ? 'Complete your profile to get better matches and meet students.' : 'Create an account to build your Erasmus profile.'}</p><button onClick={() => setShowMatchForm(true)}>Improve profile <ArrowUpRight size={14} /></button></div>
          <button className="user-chip" type="button" onClick={() => currentUser?.emailVerified ? setShowAccountSettings(true) : setAuthMode(currentUser ? 'verify-code' : 'login')}>
            <span className="avatar">{currentUser?.profilePhotoDataUrl ? <img src={currentUser.profilePhotoDataUrl} alt="" /> : currentUser ? currentUser.displayName.slice(0, 2).toUpperCase() : 'AM'}</span>
            <span><strong>{currentUser ? currentUser.displayName : 'Guest explorer'}</strong><small>{currentUser ? currentUser.emailVerified ? 'Account settings' : 'Verify email' : 'Set up account'}</small></span>
            <ChevronDown size={15} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMobileMenuOpen((previous) => !previous)}><Menu size={20} /></button>
          <div className="breadcrumb">ErasmusWithUs <span>/</span> <strong>{activeNav}</strong></div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Open shortlist" onClick={() => handleNav('Shortlist')}><Heart size={18} /></button>
            <button className="profile-button" onClick={() => currentUser?.emailVerified ? setShowAccountSettings(true) : setAuthMode(currentUser ? 'verify-code' : 'login')}>
              {currentUser ? currentUser.emailVerified ? 'Account settings' : 'Verify email' : 'Sign in'} <ArrowUpRight size={15} />
            </button>
          </div>
        </header>

        {showCatalog && <section className="intro">
          <div>
            <div className="eyebrow"><span /> 2026 / 27 exchange catalogue</div>
            <h1>Find the place<br /><em>you'll grow into.</em></h1>
            <p>Explore exchange opportunities across Europe, then find the ones that fit your degree, language, budget, and ambitions.</p>
          </div>
          <div className="intro-note">
            <span className="note-icon"><Building2 size={18} /></span>
            <div>
              <strong>Explore universities</strong>
              <small>Browse {opportunities.length} Erasmus destinations, compare study options, and check official sources.</small>
            </div>
            <div className="intro-note-actions">
              <button onClick={() => handleNav('Universities')}>Browse universities <ArrowUpRight size={15} /></button>
              <button className="match-cta" onClick={() => setShowMatchForm(true)} disabled={isMatching}>{isMatching ? 'Matching...' : 'Find my match'} <Sparkles size={15} /></button>
            </div>
          </div>
        </section>}

        {showCatalog && <section className="stats-strip">
          <div><strong>{isLoading ? '—' : opportunities.length}</strong><span>destinations indexed</span></div>
          <div><strong>{isLoading ? '—' : new Set(opportunities.map((item) => item.country)).size}</strong><span>countries indexed</span></div>
          <div><strong>{isLoading ? '—' : opportunities.filter((item) => item.verificationStatus === 'NeedsReview').length}</strong><span>need source review</span></div>
          <div className="verified-legend"><span className="status-dot" /> Source and review status shown per listing</div>
        </section>}

        {activeNav === 'Compare' && <ComparePanel opportunities={savedOpportunities} onBrowse={() => handleNav('Discover')} />}
        {activeNav === 'Planner' && <PlannerPanel tasks={plannerTasks} completed={completedPlannerTasks} onToggle={togglePlannerTask} />}
        {activeNav === 'Universities' && <UniversityDirectory opportunities={opportunities} onFindPeers={(id) => { setCommunityOpportunityId(id); handleNav('Community') }} />}
        {activeNav === 'Community' && <CommunityPanel opportunities={opportunities} user={currentUser} initialOpportunityId={communityOpportunityId} onEditProfile={() => handleNav('My account')} onSignIn={() => setAuthMode(currentUser ? 'verify-code' : 'login')} />}
        {activeNav === 'My account' && <section className="account-overview">
          {currentUser?.emailVerified ? <>
            <div className="account-overview-head">
              <div className="account-avatar-large">{currentUser.profilePhotoDataUrl ? <img src={currentUser.profilePhotoDataUrl} alt="" /> : currentUser.displayName.slice(0, 1).toUpperCase()}</div>
              <div><span className="section-kicker">MY ACCOUNT · VERIFIED</span><h2>{currentUser.displayName}</h2><p>{currentUser.email}</p><p>{currentUser.homeUniversity || 'Add your home university'} · {currentUser.studyField || 'Add your study field'}</p></div>
              <button className="primary-button" onClick={() => setShowAccountSettings(true)}>Edit profile <ArrowUpRight size={15} /></button>
            </div>
            <div className="account-summary-grid">
              <div><small>HOME UNIVERSITY</small><strong>{currentUser.homeUniversity || 'Not added'}</strong></div>
              <div><small>PLANNED INTAKE</small><strong>{currentUser.intake || 'Not selected'}</strong></div>
              <div><small>STUDY PROFILE</small><strong>{[currentUser.studyField, currentUser.level].filter(Boolean).join(' · ') || 'Not completed'}</strong></div>
              <div><small>COMMUNITY PROFILE</small><strong>{currentUser.communityVisible ? 'Visible to matching students' : 'Private'}</strong></div>
            </div>
            <p className="account-bio">{currentUser.bio || 'Add a short introduction so students with the same Erasmus plans know a little about you.'}</p>
          </> : <div className="community-gate"><span className="section-kicker">MY ACCOUNT</span><h2>Your Erasmus profile starts here.</h2><p>Sign in and verify your email to add your home university, photo, study details, and exchange plans.</p><button className="primary-button" onClick={() => setAuthMode(currentUser ? 'verify-code' : 'login')}>Sign in or verify email <ArrowUpRight size={15} /></button></div>}
        </section>}

        {showCatalog && <section className="discovery" id="opportunities">
          <div className="section-heading">
            <div>
              <span className="section-kicker">{activeNav === 'Shortlist' ? 'YOUR SHORTLIST' : 'DISCOVER OPPORTUNITIES'}</span>
              <h2>{activeNav === 'Shortlist' ? 'Your saved destinations.' : 'Where could you go?'}</h2>
            </div>
            <button className="text-button" onClick={() => { handleNav('Discover'); setSearch(''); setCountry(''); setLevel('') }}>View all destinations <ArrowUpRight size={15} /></button>
          </div>

          <div className="search-row">
            <label className="search-box"><Search size={19} /><input ref={searchInput} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search university, city, or subject..." /><kbd>⌘ K</kbd></label>
            <button className="filter-button" onClick={() => setShowFilters(!showFilters)}><Filter size={17} /> Filters <span>{[country, level].filter(Boolean).length || ''}</span></button>
            <label className="sort-control"><span className="sr-only">Sort destinations</span><select className="sort-button" value={sortMode} onChange={(event) => setSortMode(event.target.value as typeof sortMode)}><option value="recommended">Recommended</option><option value="grant">Grant: high to low</option><option value="deadline">Deadline: soonest</option></select><ChevronDown size={16} aria-hidden="true" /></label>
          </div>

          {showFilters && <div className="filter-panel"><label>Country<select value={country} onChange={(event) => setCountry(event.target.value)}><option value="">All countries</option>{countries.map((item) => <option key={item}>{item}</option>)}</select></label><label>Degree level<select value={level} onChange={(event) => setLevel(event.target.value)}><option value="">All levels</option><option>Bachelor</option><option>Master</option></select></label><button onClick={() => { setCountry(''); setLevel('') }}>Clear filters <X size={14} /></button></div>}
          {error && <div className="error-banner"><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss error"><X size={16} /></button></div>}
          <div className="results-meta"><span>{isLoading ? 'Loading destinations...' : `${visibleOpportunities.length} opportunities`}</span><span className="results-meta-right"><span className="status-dot" /> Source and review status shown per listing</span></div>
          <div className="opportunity-grid">{isLoading ? [...Array(4)].map((_, index) => <div className="opportunity-card skeleton" key={index} />) : visibleOpportunities.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} saved={saved.includes(opportunity.id)} onSave={toggleSaved} />)}</div>
          {!isLoading && visibleOpportunities.length === 0 && <div className="empty-state"><Compass size={28} /><strong>{activeNav === 'Shortlist' ? 'Your shortlist is empty' : 'No destinations found'}</strong><span>{activeNav === 'Shortlist' ? 'Use the bookmark icon to save a destination.' : 'Try clearing a filter or searching for another city.'}</span></div>}
        </section>}

        {showCatalog && <section className="match-preview" id="match-preview">
          <div className="match-copy">
            <span className="section-kicker">A SHORTCUT TO THE RIGHT FIT</span>
            <h2>Your next chapter<br /><em>is closer than you think.</em></h2>
            <p>Our matching engine weighs your field, GPA, language, budget, and what you really enjoy so the suggestions become personal rather than generic.</p>
            <button className="primary-button" onClick={() => setShowMatchForm(true)} disabled={isMatching}>{isMatching ? 'Calculating...' : 'Build my shortlist'} <ArrowUpRight size={16} /></button>
          </div>
          <div className="match-visual"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="match-center"><Sparkles size={23} /><strong>{matches.length ? `${matches[0].score}%` : '—'}</strong><span>best match</span></div><span className="city-label city-a">Helsinki</span><span className="city-label city-b">Berlin</span><span className="city-label city-c">Lisbon</span></div>
        </section>}

        {showCatalog && matches.length > 0 && <section className="match-results"><div><span className="section-kicker">YOUR MATCH RESULTS</span><h2>Start with these.</h2><p className="match-disclaimer">The score explains fit, not eligibility. Your home university coordinator must confirm the bilateral agreement and nomination.</p></div><div className="match-result-list">{matches.slice(0, 3).map((match) => <article key={match.opportunity.id}><span className="match-score">{match.score}%</span><div><strong>{match.opportunity.university}</strong><small>{match.opportunity.city}, {match.opportunity.country} · {match.reasons[0] ?? 'Fits your profile'}</small><div className="match-breakdown">{match.breakdown.filter((factor) => factor.points > 0).slice(0, 4).map((factor) => <span key={factor.name}>{factor.name} +{factor.points}</span>)}</div></div><button onClick={() => toggleSaved(match.opportunity.id)} aria-label="Save match"><Bookmark size={17} fill={saved.includes(match.opportunity.id) ? 'currentColor' : 'none'} /></button></article>)}</div></section>}
      </main>

      {showMatchForm && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowMatchForm(false) }}><section className="auth-modal match-modal" role="dialog" aria-modal="true" aria-labelledby="match-title"><button className="modal-close" onClick={() => setShowMatchForm(false)} aria-label="Close"><X size={18} /></button><span className="section-kicker">FIND MY MATCH</span><h2 id="match-title">Tell us what suits you.</h2><p>Pick your preferences below to get a personalised shortlist without typing free-form answers.</p><form className="match-form" onSubmit={(event) => { event.preventDefault(); void findMatches(matchProfile) }}><div className="match-grid"><label>Home country<select value={matchProfile.country} onChange={(event) => updateMatchProfile('country', event.target.value)}><option value="">Select country</option>{countryCatalog.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label>Study field<select value={matchProfile.studyField} onChange={(event) => updateMatchProfile('studyField', event.target.value)}>{studyFieldOptions.map((item) => <option key={item}>{item}</option>)}</select></label><label>Degree level<select value={matchProfile.level} onChange={(event) => updateMatchProfile('level', event.target.value)}>{degreeOptions.map((item) => <option key={item}>{item}</option>)}</select></label><label>GPA<select value={String(matchProfile.gpa)} onChange={(event) => updateMatchProfile('gpa', Number(event.target.value))}>{[2.0, 2.5, 2.7, 3.0, 3.2, 3.5, 3.7, 4.0].map((value) => <option key={value} value={String(value)}>{value.toFixed(1)}</option>)}</select></label><label>Monthly budget (EUR)<select value={String(matchProfile.budget ?? 0)} onChange={(event) => updateMatchProfile('budget', Number(event.target.value))}>{budgetOptions.map((value) => <option key={value} value={String(value)}>{value} EUR</option>)}</select></label></div><label>Preferred countries<div className="chip-grid">{countries.map((countryName) => <button type="button" key={countryName} className={`chip ${matchProfile.preferredCountries.includes(countryName) ? 'active' : ''}`} onClick={() => toggleMultiChoice('preferredCountries', countryName, matchProfile, (next) => setMatchProfile(next))}>{countryName}</button>)}</div></label><label>Languages<div className="chip-grid">{languageOptions.map((language) => <button type="button" key={language} className={`chip ${matchProfile.languages.includes(language) ? 'active' : ''}`} onClick={() => toggleMultiChoice('languages', language, matchProfile, (next) => setMatchProfile(next))}>{language}</button>)}</div></label><label>What you like<div className="chip-grid">{lifestyleOptions.map((item) => <button type="button" key={item} className={`chip ${matchProfile.likes?.includes(item) ? 'active' : ''}`} onClick={() => toggleMultiChoice('likes', item, matchProfile, (next) => setMatchProfile(next))}>{item}</button>)}</div></label><label>What you dislike<div className="chip-grid">{['Very cold winters', 'High living cost', 'Very isolated city', 'Low grant', 'Fast-paced city', 'Limited international community', 'Heavy bureaucracy', 'Remote campus'].map((item) => <button type="button" key={item} className={`chip ${matchProfile.dislikes?.includes(item) ? 'active' : ''}`} onClick={() => toggleMultiChoice('dislikes', item, matchProfile, (next) => setMatchProfile(next))}>{item}</button>)}</div></label><button type="submit" className="primary-button auth-submit" disabled={isMatching}>{isMatching ? 'Matching...' : 'Find best fit'} <ArrowUpRight size={15} /></button></form></section></div>}

      {showAccountSettings && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAccountSettings(false) }}>
        <section className="auth-modal account-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
          <button className="modal-close" onClick={() => setShowAccountSettings(false)} aria-label="Close"><X size={18} /></button>
          <span className="section-kicker">MY ERASMUS PROFILE</span>
          <h2 id="settings-title">Your account, built around your exchange.</h2>
          <p>Set up your study profile and choose what other students planning the same university can see.</p>
          <form className="account-form" onSubmit={saveSettings}>
            <div className="account-photo-picker">
              <div className="account-avatar-large">{profilePhotoDataUrl ? <img src={profilePhotoDataUrl} alt="Profile preview" /> : accountDisplayName.slice(0, 1).toUpperCase()}</div>
              <div className="account-photo-copy"><strong>Profile photo</strong><small>JPEG after upload. Your email and GPA stay private from other students.</small></div>
              <label className="photo-upload-button">Choose photo<input type="file" accept="image/*" onChange={(event) => { void handleProfilePhotoChange(event) }} /></label>
              {profilePhotoDataUrl && <button className="photo-remove-button" type="button" onClick={() => { setProfilePhotoDataUrl(null); setProfilePhotoDirty(false); setRemoveProfilePhoto(true) }}>Remove</button>}
            </div>
            <div className="account-section-heading"><strong>About you</strong><span>Used for your profile and university matching.</span></div>
            <div className="match-grid">
              <label>Display name<input required minLength={2} maxLength={80} value={accountDisplayName} onChange={(event) => setAccountDisplayName(event.target.value)} /></label>
              <label>Home university<input maxLength={160} value={settingsProfile.homeUniversity} onChange={(event) => updateSettingsProfile('homeUniversity', event.target.value)} placeholder="Your current university" /></label>
              <label>Home country<select value={settingsProfile.country} onChange={(event) => updateSettingsProfile('country', event.target.value)}><option value="">Select country</option>{countryCatalog.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              <label>Study field<select value={settingsProfile.studyField} onChange={(event) => updateSettingsProfile('studyField', event.target.value)}>{studyFieldOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>Degree level<select value={settingsProfile.level} onChange={(event) => updateSettingsProfile('level', event.target.value)}>{degreeOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>Current GPA<select value={String(settingsProfile.gpa)} onChange={(event) => updateSettingsProfile('gpa', Number(event.target.value))}>{[2.0, 2.5, 2.7, 3.0, 3.2, 3.5, 3.7, 4.0].map((value) => <option key={value} value={String(value)}>{value.toFixed(1)}</option>)}</select></label>
              <label>Planned Erasmus intake<select value={settingsProfile.intake} onChange={(event) => updateSettingsProfile('intake', event.target.value)}>{['Autumn 2026/27', 'Spring 2026/27', 'Autumn 2027/28', 'Spring 2027/28'].map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="account-bio-field">Short introduction<textarea maxLength={320} value={accountBio} onChange={(event) => setAccountBio(event.target.value)} placeholder="What are you studying and what are you looking forward to?" rows={3} /></label>
            </div>
            <label className="account-field-label">Preferred countries<div className="chip-grid">{countries.map((countryName) => <button type="button" key={countryName} className={'chip ' + (settingsProfile.preferredCountries.includes(countryName) ? 'active' : '')} onClick={() => toggleMultiChoice('preferredCountries', countryName, settingsProfile, (next) => setSettingsProfile(next))}>{countryName}</button>)}</div></label>
            <label className="account-field-label">Languages<div className="chip-grid">{languageOptions.map((language) => <button type="button" key={language} className={'chip ' + (settingsProfile.languages.includes(language) ? 'active' : '')} onClick={() => toggleMultiChoice('languages', language, settingsProfile, (next) => setSettingsProfile(next))}>{language}</button>)}</div></label>
            <label className="community-visibility"><input type="checkbox" checked={communityVisible} onChange={(event) => setCommunityVisible(event.target.checked)} /><span><strong>Show my profile to matching students</strong><small>Students with the same destination and intake can see your photo, display name, home university, field and introduction. Your email and GPA are never shown.</small></span></label>
            {settingsMessage && <div className="auth-message" role="status">{settingsMessage}</div>}
            <button className="primary-button auth-submit" type="submit" disabled={isSavingSettings}>{isSavingSettings ? 'Saving…' : 'Save my Erasmus profile'} <ArrowUpRight size={15} /></button>
          </form>
        </section>
      </div>}

      {authMode && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && authMode !== 'verify-code') setAuthMode(null) }}>
        <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
          <button className="modal-close" onClick={() => { if (authMode !== 'verify-code') setAuthMode(null) }} aria-label="Close"><X size={18} /></button>
          <span className="section-kicker">ERASMUSWITHUS ACCOUNT</span>
          <h2 id="auth-title">{authMode === 'login' ? 'Welcome back.' : authMode === 'register' ? 'Start your journey.' : authMode === 'forgot-password' || authMode === 'reset-password' ? 'Reset your password.' : 'Check your email.'}</h2>
          <p>{authMode === 'login' || authMode === 'register' ? 'Save destinations, build your profile, and keep your Erasmus plan in one place.' : authMode === 'verify-code' ? 'Enter the six-letter code we sent to your email before continuing.' : authMode === 'reset-password' ? 'Enter the reset code from your email and choose a new password.' : 'Request a secure password reset code for your account.'}</p>
          {authMode === 'login' || authMode === 'register' ? <form onSubmit={submitAuth}>
            {authMode === 'register' && <label>Name<input required value={authName} onChange={(event) => setAuthName(event.target.value)} placeholder="Your name" /></label>}
            <label>Email<input required type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="you@example.com" /></label>
            <label>Password<input required minLength={8} type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="At least 8 characters" /></label>
            <button className="primary-button auth-submit" type="submit">{authMode === 'login' ? 'Sign in' : 'Create account'} <ArrowUpRight size={15} /></button>
          </form> : authMode === 'forgot-password' ? <form onSubmit={(event) => { event.preventDefault(); void handleForgotPassword() }}>
            <label>Email<input required type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="you@example.com" /></label>
            <button className="primary-button auth-submit" type="submit">Send reset code <ArrowUpRight size={15} /></button>
          </form> : authMode === 'reset-password' ? <form onSubmit={(event) => { event.preventDefault(); void handleResetPassword() }}>
            <label>Reset code<input required autoCapitalize="characters" value={authPassword} onChange={(event) => setAuthPassword(event.target.value.toUpperCase())} placeholder="Paste the code from your email" /></label>
            <label>New password<input required minLength={8} type="password" value={authNewPassword} onChange={(event) => setAuthNewPassword(event.target.value)} placeholder="At least 8 characters" /></label>
            <button className="primary-button auth-submit" type="submit">Set new password <ArrowUpRight size={15} /></button>
          </form> : <form onSubmit={(event) => { event.preventDefault(); void handleVerifyEmailToken() }}>
            <label>Six-letter verification code<input required maxLength={6} autoCapitalize="characters" value={authPassword} onChange={(event) => setAuthPassword(event.target.value.toUpperCase())} placeholder="ABCDEF" /></label>
            <button className="primary-button auth-submit" type="submit">Verify and continue <ArrowUpRight size={15} /></button>
          </form>}
          {authMessage && <div className="auth-message" role="status">{authMessage}</div>}
          {authMode === 'verify-code' && <div className="auth-actions"><button className="switch-auth" type="button" onClick={() => { void handleResendVerificationCode() }}>Resend verification code</button></div>}
          {authMode !== 'verify-code' && <div className="auth-actions">{authMode === 'login' || authMode === 'register' ? <>
            <button className="switch-auth" type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthMessage('') }}>{authMode === 'login' ? 'Need an account? Create one' : 'Already have an account? Sign in'}</button>
            <button className="switch-auth" type="button" onClick={() => { setAuthMode('forgot-password'); setAuthPassword(''); setAuthNewPassword(''); setAuthMessage('') }}>Forgot password?</button>
          </> : <button className="switch-auth" type="button" onClick={() => { setAuthMode('login'); setAuthMessage('') }}>Back to sign in</button>}</div>}
        </section>
      </div>}
    </div>
  )
}

export default App
