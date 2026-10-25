import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowUpRight, Ban, Bell, Flag, MessageCircle, RefreshCw, Send, Users } from 'lucide-react'
import {
  blockCommunityUser,
  createStudentPlan,
  deleteStudentPlan,
  getCommunityBlocks,
  getCommunityStudents,
  getConversations,
  getMessages,
  getStudentPlans,
  reportCommunityUser,
  sendMessage,
  startConversation,
  unblockCommunityUser,
} from '../lib/api'
import type {
  ChatMessage, CommunityStudent, ConversationSummary, ErasmusOpportunity, StudentPlan, User,
} from '../types/erasmus'
import { usePreferences } from '../preferences'

const intakes = ['Autumn 2026/27', 'Spring 2026/27', 'Autumn 2027/28', 'Spring 2027/28']

export default function CommunityPanel({ opportunities, user, initialOpportunityId, onEditProfile, onSignIn }: {
  opportunities: ErasmusOpportunity[]
  user: User | null
  initialOpportunityId?: number
  onEditProfile: () => void
  onSignIn: () => void
}) {
  const { t } = usePreferences()
  const token = localStorage.getItem('erasmuswithus.token') ?? ''
  const [opportunityId, setOpportunityId] = useState(initialOpportunityId ?? opportunities[0]?.id ?? 0)
  const [intake, setIntake] = useState(user?.intake || intakes[0])
  const [roommatesOnly, setRoommatesOnly] = useState(false)
  const [plans, setPlans] = useState<StudentPlan[]>([])
  const [students, setStudents] = useState<CommunityStudent[]>([])
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [messagesConversationId, setMessagesConversationId] = useState<number | null>(null)
  const [blockedUserIds, setBlockedUserIds] = useState<number[]>([])
  const [showReportForm, setShowReportForm] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [notice, setNotice] = useState('')
  const [notificationPermission, setNotificationPermission] = useState(() => typeof Notification === 'undefined' ? 'unsupported' : Notification.permission)
  const [error, setError] = useState('')

  const selectedOpportunityId = opportunityId || opportunities[0]?.id || 0
  const selectedOpportunity = useMemo(
    () => opportunities.find((item) => item.id === selectedOpportunityId),
    [opportunities, selectedOpportunityId],
  )
  const hasPlan = plans.some((plan) => plan.opportunityId === selectedOpportunityId && plan.intake === intake)
  const activeConversation = conversations.find((item) => item.id === activeConversationId) ?? null

  useEffect(() => {
    if (!token || !user?.emailVerified) return
    let cancelled = false
    Promise.all([getStudentPlans(token), getConversations(token), getCommunityBlocks(token)])
      .then(([nextPlans, nextConversations, nextBlockedUserIds]) => {
        if (cancelled) return
        setPlans(nextPlans)
        setConversations(nextConversations)
        setBlockedUserIds(nextBlockedUserIds)
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : 'Could not load the student community.')
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [token, user?.emailVerified])

  useEffect(() => {
    if (!token || !user?.emailVerified || !selectedOpportunityId) return
    let cancelled = false
    getCommunityStudents(token, selectedOpportunityId, intake, roommatesOnly)
      .then((result) => { if (!cancelled) setStudents(result) })
      .catch((requestError) => {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : 'Could not find students for this destination.')
      })
    return () => { cancelled = true }
  }, [token, user?.emailVerified, selectedOpportunityId, intake, roommatesOnly])

  useEffect(() => {
    if (!token || !activeConversationId) {
      return
    }
    let cancelled = false
    const refresh = () => getMessages(token, activeConversationId)
      .then((result) => {
        if (!cancelled) {
          setMessages(result)
          setMessagesConversationId(activeConversationId)
        }
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : 'Could not load this conversation.')
      })
    void refresh()
    const timer = window.setInterval(() => { void refresh() }, 5000)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [token, activeConversationId])

  async function refreshConversations() {
    if (!token) return
    try {
      setConversations(await getConversations(token))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not refresh conversations.')
    }
  }

  async function togglePlan() {
    if (!token || !selectedOpportunity) return
    setError('')
    try {
      if (hasPlan) {
        const plan = plans.find((item) => item.opportunityId === selectedOpportunityId && item.intake === intake)
        if (plan) await deleteStudentPlan(token, plan.id)
        setPlans((current) => current.filter((item) => item.id !== plan?.id))
      } else {
        const created = await createStudentPlan(token, { opportunityId: selectedOpportunityId, intake })
        setPlans((current) => [created, ...current.filter((item) => item.id !== created.id)])
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update your Erasmus plan.')
    }
  }

  async function openConversation(student: CommunityStudent) {
    if (!token || !selectedOpportunity) return
    setError('')
    try {
      const response = await startConversation(token, {
        recipientUserId: student.id,
        opportunityId: selectedOpportunityId,
        intake,
      })
      await refreshConversations()
      setActiveConversationId(response.conversationId)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not start this conversation.')
    }
  }

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token || !activeConversationId || !draft.trim() || isSending) return
    setIsSending(true)
    setError('')
    try {
      const sent = await sendMessage(token, activeConversationId, draft.trim())
      setMessagesConversationId(activeConversationId)
      setMessages((current) => [...current, sent])
      setDraft('')
      await refreshConversations()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not send this message.')
    } finally {
      setIsSending(false)
    }
  }

  async function toggleBlock() {
    if (!activeConversation || !token) return
    const otherUserId = activeConversation.otherUserId
    setError(''); setNotice('')
    try {
      if (blockedUserIds.includes(otherUserId)) {
        await unblockCommunityUser(token, otherUserId)
        setBlockedUserIds((current) => current.filter((id) => id !== otherUserId))
        setNotice('Student unblocked. They may be able to find and message you again.')
      } else {
        await blockCommunityUser(token, otherUserId)
        setBlockedUserIds((current) => [...current, otherUserId])
        setNotice('Student blocked. They will not appear in your matching student list.')
      }
      await refreshConversations()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update this block.')
    }
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!activeConversation || !token || !reportReason.trim()) return
    setError(''); setNotice('')
    try {
      await reportCommunityUser(token, { reportedUserId: activeConversation.otherUserId, conversationId: activeConversation.id, reason: reportReason.trim() })
      setReportReason('')
      setShowReportForm(false)
      setNotice('Report submitted for review.')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not submit this report.')
    }
  }

  async function requestNotifications() {
    if (typeof Notification === 'undefined') return
    const permission = await Notification.requestPermission()
    setNotificationPermission(permission)
  }

  if (!user?.emailVerified || !token) {
    return <section className="community-gate">
      <div className="community-gate-icon"><Users size={24} /></div>
      <span className="section-kicker">{t('STUDENT COMMUNITY')}</span>
      <h2>{t('Meet the people going where you’re going.')}</h2>
      <p>{t('Create and verify an account to find students planning the same destination and intake, then message them directly.')}</p>
      <button className="primary-button" onClick={onSignIn}>{t('Sign in or create an account')} <ArrowUpRight size={15} /></button>
    </section>
  }

  return <section className="community-page">
    <div className="community-heading">
      <div>
        <span className="section-kicker">{t('STUDENT COMMUNITY')}</span>
        <h2>{t('Make the move together.')}</h2>
        <p>{t('Find other students planning the same Erasmus destination and semester.')}</p>
      </div>
      <div className="community-heading-actions">{notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && <button className="community-notifications" type="button" onClick={() => { void requestNotifications() }}><Bell size={15} />{t('Enable message alerts')}</button>}<button className="community-refresh" type="button" onClick={() => { void refreshConversations() }} aria-label={t('Refresh conversations')}><RefreshCw size={16} /></button></div>
    </div>

    <div className="community-consent">
      <div className="community-avatar">
        {user.profilePhotoDataUrl ? <img src={user.profilePhotoDataUrl} alt="" /> : user.displayName.slice(0, 1).toUpperCase()}
      </div>
      <div><strong>{t(user.communityVisible ? 'Your profile is visible to matching students' : 'You’re browsing privately')}</strong>
        <small>{t(user.communityVisible ? 'Only your name, university, study field, bio, and photo are shared.' : 'Opt in from My Account if you want matching students to find you.')}</small>
      </div>
      <button className="text-button" onClick={onEditProfile}>{t('My account')} <ArrowUpRight size={14} /></button>
    </div>

    <div className="community-workspace">
      <div className="community-discovery">
        <div className="community-filters">
          <label>{t('Destination university')}<select value={selectedOpportunityId} onChange={(event) => setOpportunityId(Number(event.target.value))}>
            {opportunities.map((item) => <option key={item.id} value={item.id}>{item.university} · {item.country}</option>)}
          </select></label>
          <label>{t('Intake')}<select value={intake} onChange={(event) => setIntake(event.target.value)}>
            {intakes.map((item) => <option key={item} value={item}>{t(item)}</option>)}
          </select></label>
          <button className={hasPlan ? 'plan-toggle joined' : 'plan-toggle'} type="button" onClick={() => { void togglePlan() }}>
            {t(hasPlan ? 'Remove my plan' : 'Add to my plan')}
          </button>
          <label className="roommate-filter"><input type="checkbox" checked={roommatesOnly} onChange={(event) => setRoommatesOnly(event.target.checked)} /><span>{t('Only show students looking for a roommate')}</span></label>
        </div>
        <div className="peer-heading"><div><strong>{selectedOpportunity ? t('Going to {university}').replace('{university}', selectedOpportunity.university) : t('your destination')}</strong><span>{students.length} {t('matching students')}</span></div><small>{t(intake)}</small></div>
        {!hasPlan && <p className="community-hint">{t('Add this destination to your plan before messaging a student.')}</p>}
        {isLoading && students.length === 0 ? <div className="community-empty">{t('Finding students…')}</div> : students.length === 0 ? <div className="community-empty"><Users size={24} /><strong>{t('No students found yet')}</strong><span>{t('Try another intake or share your own plan so others can find you.')}</span></div> :
          <div className="peer-list">{students.map((student) => <article className="peer-card" key={student.id}>
            <div className="peer-avatar">{student.profilePhotoDataUrl ? <img src={student.profilePhotoDataUrl} alt="" /> : student.displayName.slice(0, 1).toUpperCase()}</div>
            <div className="peer-info"><strong>{student.displayName}</strong><span>{student.homeUniversity || t('Home university not added')}</span><small>{[student.studyField, student.level].filter(Boolean).map((value) => t(value!)).join(' · ')}</small>{student.roommateSearch && <span className="roommate-badge">{t('Open to sharing housing')}</span>}{student.bio && <p>{student.bio}</p>}</div>
            <button type="button" className="peer-message" disabled={!hasPlan} onClick={() => { void openConversation(student) }} aria-label={`${t('Message')} ${student.displayName}`}><MessageCircle size={17} /></button>
          </article>)}</div>}
      </div>

      <aside className="community-chat">
        <div className="conversation-head"><div><strong>{t('Messages')}</strong><span>{t('Private conversations between students')}</span></div><MessageCircle size={18} /></div>
        <div className="conversation-list">{conversations.length === 0 ? <p className="conversation-empty">{t('Your conversations will appear here.')}</p> : conversations.map((conversation) =>
          <button type="button" key={conversation.id} className={'conversation-item ' + (activeConversationId === conversation.id ? 'selected' : '')} onClick={() => setActiveConversationId(conversation.id)}>
            <div className="peer-avatar small">{conversation.otherProfilePhotoDataUrl ? <img src={conversation.otherProfilePhotoDataUrl} alt="" /> : conversation.otherDisplayName.slice(0, 1).toUpperCase()}</div>
            <span><strong>{conversation.otherDisplayName}</strong><small>{conversation.lastMessage || conversation.university}</small></span>{(conversation.unreadCount ?? 0) > 0 && <b className="unread-badge">{conversation.unreadCount}</b>}
          </button>)}</div>
        {activeConversation && <div className="chat-thread">
          <div className="chat-thread-heading"><div><strong>{activeConversation.otherDisplayName}</strong><small>{activeConversation.university} · {t(activeConversation.intake)}</small></div><div className="chat-safety-actions"><button type="button" onClick={() => { setShowReportForm((value) => !value); setError(''); setNotice('') }} aria-label={t('Report student')} title={t('Report student')}><Flag size={15} /></button><button type="button" onClick={() => { void toggleBlock() }} disabled={activeConversation.isBlocked && !blockedUserIds.includes(activeConversation.otherUserId)} aria-label={t(blockedUserIds.includes(activeConversation.otherUserId) ? 'Unblock student' : 'Block student')} title={t(blockedUserIds.includes(activeConversation.otherUserId) ? 'Unblock student' : 'Block student')}><Ban size={15} /></button></div></div>
          {showReportForm && <form className="chat-report-form" onSubmit={(event) => { void submitReport(event) }}><label>{t('Tell us why you are reporting this student')}<textarea value={reportReason} maxLength={500} rows={3} onChange={(event) => setReportReason(event.target.value)} /></label><div><small>{reportReason.length}/500</small><button type="submit" className="text-button" disabled={!reportReason.trim()}>{t('Submit report')}</button></div></form>}
          {activeConversation.isBlocked && <p className="chat-blocked-notice">{t(blockedUserIds.includes(activeConversation.otherUserId) ? 'You blocked this student. Messages are disabled.' : 'This student has blocked this conversation. Messages are disabled.')}</p>}
          <div className="chat-messages">{(messagesConversationId === activeConversationId ? messages : []).map((message) => <div key={message.id} className={'chat-bubble ' + (message.senderUserId === user.id ? 'mine' : '')}>
            <p>{message.content}</p><small>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
          </div>)}</div>
          <form className="chat-compose" onSubmit={(event) => { void submitMessage(event) }}>
            <input value={draft} maxLength={2000} onChange={(event) => setDraft(event.target.value)} placeholder={t(activeConversation.isBlocked ? 'Messaging is disabled' : 'Write a message…')} aria-label={t('Write a message')} disabled={activeConversation.isBlocked} />
            <button type="submit" disabled={!draft.trim() || isSending || activeConversation.isBlocked} aria-label={t('Send message')}><Send size={16} /></button>
          </form>
        </div>}
        {!activeConversation && <div className="chat-empty"><MessageCircle size={22} /><span>{t('Choose a student to start a conversation.')}</span></div>}
      </aside>
    </div>
    {notice && <div className="community-notice">{t(notice)}<button onClick={() => setNotice('')} aria-label={t('Dismiss notice')}>×</button></div>}
    {error && <div className="error-banner"><span>{t(error)}</span><button onClick={() => setError('')} aria-label={t('Dismiss error')}>×</button></div>}
  </section>
}
