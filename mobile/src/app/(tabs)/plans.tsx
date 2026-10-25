import { useCallback, useState } from 'react'
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { Button, Card, EmptyState, ErrorBanner, Loading, Page, PageHeading, Pill } from '../../components/ui'
import { deleteDeadlineReminder, deletePlan, getDeadlineReminders, getPlans, updatePlan } from '../../lib/api'
import { formatDate } from '../../lib/format'
import { colors } from '../../lib/theme'
import type { DeadlineReminder, StudentPlan } from '../../lib/types'
import { useAuth } from '../../providers/auth-provider'

const trackerTasks = [
  'Confirm exchange agreement with my coordinator',
  'Check eligibility and course language',
  'Prepare transcript and language certificate',
  'Submit my university nomination',
  'Submit the application and learning agreement',
  'Arrange housing, insurance, and travel',
]
const trackerStages = ['Considering', 'Preparing', 'Submitted', 'Nominated', 'Accepted', 'Completed']

export default function PlansScreen() {
  const { token, user } = useAuth()
  const [plans, setPlans] = useState<StudentPlan[]>([])
  const [reminders, setReminders] = useState<DeadlineReminder[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [savingPlanId, setSavingPlanId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!token) return
    setError('')
    try {
      const [nextPlans, nextReminders] = await Promise.all([getPlans(token), getDeadlineReminders(token)])
      setPlans(nextPlans)
      setReminders(nextReminders)
    }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not load your plans.') }
    finally { setLoading(false) }
  }, [token])
  useFocusEffect(useCallback(() => { setLoading(true); void load() }, [load]))

  async function removePlan(plan: StudentPlan) {
    if (!token) return
    setDeletingId(plan.id)
    setError('')
    try { await deletePlan(token, plan.id); setPlans((current) => current.filter((item) => item.id !== plan.id)) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not remove this plan.') }
    finally { setDeletingId(null) }
  }

  async function removeReminder(reminder: DeadlineReminder) {
    if (!token) return
    try {
      await deleteDeadlineReminder(token, reminder.id)
      setReminders((current) => current.filter((item) => item.id !== reminder.id))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not remove this reminder.')
    }
  }

  async function updateTracker(plan: StudentPlan, changes: { stage?: string; completedTasks?: string[] }) {
    if (!token) return
    setSavingPlanId(plan.id); setError('')
    try {
      const updated = await updatePlan(token, plan.id, {
        stage: changes.stage ?? plan.stage ?? 'Considering',
        completedTasks: changes.completedTasks ?? plan.completedTasks ?? [],
      })
      setPlans((current) => current.map((item) => item.id === updated.id ? updated : item))
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not save your application progress.') }
    finally { setSavingPlanId(null) }
  }

  function addToCalendar(reminder: DeadlineReminder) {
    const start = reminder.deadline.replace(/-/g, '')
    const date = new Date(`${reminder.deadline}T00:00:00Z`)
    const end = new Date(date.getTime() + 86_400_000).toISOString().slice(0, 10).replace(/-/g, '')
    const url = new URL('https://calendar.google.com/calendar/render')
    url.searchParams.set('action', 'TEMPLATE')
    url.searchParams.set('text', `${reminder.university} application deadline`)
    url.searchParams.set('dates', `${start}/${end}`)
    url.searchParams.set('details', `Confirm the current deadline with the university. Your Erasmus With Us email reminder is set for ${reminder.daysBefore} days before.`)
    void Linking.openURL(url.toString())
  }

  if (!token) return null
  return <Page>
    <PageHeading eyebrow="Keep the next step close" title="My plans" subtitle="Destinations you are considering, plus the students heading there too." action={<View style={styles.count}><Text style={styles.countText}>{plans.length}</Text></View>} />
    <Card style={styles.communityCard}><View style={styles.communityHeader}><View style={styles.communityMark}><Text style={styles.communityMarkText}>✦</Text></View><Pill tone={user?.communityVisible ? 'green' : 'neutral'}>{user?.communityVisible ? 'VISIBLE TO STUDENTS' : 'HIDDEN FROM STUDENTS'}</Pill></View><Text style={styles.communityTitle}>{user?.communityVisible ? 'Your exchange circle can find you' : 'Turn on your exchange circle'}</Text><Text style={styles.communityBody}>{user?.communityVisible ? 'Students with the same university and intake can see your profile and start a conversation.' : 'Choose whether other students can discover your profile. Change this any time in Profile.'}</Text>{!user?.communityVisible ? <Button label="Open profile settings" onPress={() => router.push('/(tabs)/profile')} variant="secondary" compact /> : null}</Card>
    <Button label="Plan my monthly budget →" onPress={() => router.push('/budget')} variant="secondary" />
    {error ? <ErrorBanner message={error} onRetry={() => { setLoading(true); void load() }} /> : null}
    {loading ? <Loading label="Loading your exchange plans..." /> : plans.map((plan) => <Card key={plan.id} style={styles.planCard}>
      <View style={styles.destinationRow}><View style={styles.destinationIcon}><Text style={styles.destinationGlyph}>⌖</Text></View><View style={styles.destinationCopy}><Text style={styles.university}>{plan.university}</Text><Text style={styles.planDate}>Added {formatDate(plan.createdAt)}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Remove plan" onPress={() => removePlan(plan)} disabled={deletingId === plan.id} style={styles.remove}><Text style={styles.removeText}>{deletingId === plan.id ? '…' : '×'}</Text></Pressable></View>
      <View style={styles.intakeRow}><Text style={styles.intakeLabel}>EXCHANGE TERM</Text><Pill tone="gold">{plan.intake}</Pill></View>
      <Text style={styles.trackerTitle}>APPLICATION STAGE</Text><View style={styles.stageWrap}>{trackerStages.map((stage) => <Pressable key={stage} disabled={savingPlanId === plan.id} onPress={() => { void updateTracker(plan, { stage }) }} style={[styles.stageChip, (plan.stage || 'Considering') === stage && styles.stageChipActive]}><Text style={[styles.stageText, (plan.stage || 'Considering') === stage && styles.stageTextActive]}>{stage}</Text></Pressable>)}</View>
      <View style={styles.trackerProgress}><Text style={styles.trackerTitle}>APPLICATION CHECKLIST</Text><Text style={styles.progressCount}>{(plan.completedTasks ?? []).length}/{trackerTasks.length}</Text></View>
      {trackerTasks.map((task) => {
        const complete = (plan.completedTasks ?? []).includes(task)
        return <Pressable key={task} accessibilityRole="checkbox" accessibilityState={{ checked: complete }} disabled={savingPlanId === plan.id} onPress={() => { const next = complete ? plan.completedTasks.filter((item) => item !== task) : [...plan.completedTasks, task]; void updateTracker(plan, { completedTasks: next }) }} style={styles.taskRow}><View style={[styles.taskCheck, complete && styles.taskCheckActive]}><Text style={styles.taskCheckGlyph}>{complete ? '✓' : ''}</Text></View><Text style={styles.taskText}>{task}</Text></Pressable>
      })}
      <Button label="Find students going  →" onPress={() => router.push({ pathname: '/students/[opportunityId]', params: { opportunityId: String(plan.opportunityId), intake: plan.intake, university: plan.university } })} compact />
    </Card>)}
    {!loading && reminders.length > 0 ? <><PageHeading eyebrow="Stay on top of dates" title="Deadline reminders" subtitle="We send one email before the listed application deadline." />{reminders.map((reminder) => <Card key={reminder.id} style={styles.reminderCard}><View style={styles.reminderCopy}><Text style={styles.university}>{reminder.university}</Text><Text style={styles.planDate}>Deadline {formatDate(reminder.deadline)} · Remind me {reminder.daysBefore} days before{reminder.sentAt ? ' · Email sent' : ''}</Text><Pressable onPress={() => addToCalendar(reminder)}><Text style={styles.calendarLink}>＋ Add to calendar</Text></Pressable></View><Pressable onPress={() => { void removeReminder(reminder) }} style={styles.remove}><Text style={styles.removeText}>×</Text></Pressable></Card>)}</> : null}
    {!loading && !error && plans.length === 0 ? <Card><EmptyState icon="⌖" title="Your plans start here" detail="Save a destination and intake from any university page. Then find students headed there too." action={<Button label="Explore universities" onPress={() => router.push('/(tabs)/universities')} compact />} /></Card> : null}
    {!loading && plans.length > 0 ? <Pressable onPress={() => router.push('/(tabs)/universities')}><Text style={styles.addMore}>+  Explore another university</Text></Pressable> : null}
  </Page>
}

const styles = StyleSheet.create({
  count: { width: 39, height: 39, borderRadius: 20, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  countText: { color: colors.greenDark, fontSize: 16, fontWeight: '800' },
  communityCard: { backgroundColor: colors.greenDark, borderColor: colors.greenDark, gap: 10 },
  communityHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  communityMark: { width: 31, height: 31, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  communityMarkText: { color: colors.gold, fontSize: 17 },
  communityTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  communityBody: { color: '#C8DDD4', fontSize: 12, lineHeight: 18 },
  planCard: { gap: 14 },
  reminderCard: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reminderCopy: { flex: 1, gap: 4 },
  destinationRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  destinationIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  destinationGlyph: { color: colors.greenDark, fontSize: 22, fontWeight: '700' },
  destinationCopy: { flex: 1, gap: 3 },
  university: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  planDate: { color: colors.muted, fontSize: 10 },
  remove: { width: 29, height: 29, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: '#F4F5F2' },
  removeText: { color: colors.muted, fontSize: 19, lineHeight: 23 },
  intakeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopColor: colors.line, borderTopWidth: 1, paddingTop: 11 },
  intakeLabel: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  trackerTitle: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.9 },
  stageWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  stageChip: { borderWidth: 1, borderColor: colors.line, borderRadius: 18, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: '#FFFFFF' },
  stageChipActive: { borderColor: colors.greenDark, backgroundColor: colors.greenDark },
  stageText: { color: colors.muted, fontSize: 9, fontWeight: '700' },
  stageTextActive: { color: '#FFFFFF' },
  trackerProgress: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 5 },
  progressCount: { color: colors.greenDark, fontSize: 10, fontWeight: '800' },
  taskRow: { flexDirection: 'row', gap: 9, alignItems: 'center', paddingVertical: 3 },
  taskCheck: { width: 20, height: 20, borderRadius: 7, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  taskCheckActive: { backgroundColor: colors.green, borderColor: colors.green },
  taskCheckGlyph: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  taskText: { flex: 1, color: colors.ink, fontSize: 11, lineHeight: 16 },
  calendarLink: { color: colors.green, fontSize: 10, fontWeight: '800', paddingTop: 4 },
  addMore: { color: colors.green, textAlign: 'center', fontSize: 12, fontWeight: '800', padding: 9 },
})
