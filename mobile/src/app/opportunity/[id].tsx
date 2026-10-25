import { useEffect, useState } from 'react'
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import { Redirect, router, useLocalSearchParams } from 'expo-router'
import { Button, Card, ErrorBanner, Field, Loading, Page, Pill } from '../../components/ui'
import { answerOpportunityQuestion, askOpportunityQuestion, createPlan, deleteDeadlineReminder, getDeadlineReminders, getExperiences, getOpportunity, getOpportunityQuestions, saveDeadlineReminder, saveExperience, submitCatalogCorrection } from '../../lib/api'
import { formatDate, formatEuro } from '../../lib/format'
import { colors, radius } from '../../lib/theme'
import type { DeadlineReminder, ExperienceSummary, Opportunity, OpportunityQuestion } from '../../lib/types'
import { useAuth } from '../../providers/auth-provider'

export default function OpportunityDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { token, user } = useAuth()
  const sessionToken = token ?? ''
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [intake, setIntake] = useState(user?.intake ?? 'Autumn 2026/27')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [reminder, setReminder] = useState<DeadlineReminder | null>(null)
  const [experiences, setExperiences] = useState<ExperienceSummary | null>(null)
  const [experienceType, setExperienceType] = useState<'Alumni' | 'Planning'>('Planning')
  const [experienceRating, setExperienceRating] = useState(5)
  const [experienceIntake, setExperienceIntake] = useState(user?.intake ?? 'Autumn 2026/27')
  const [experienceText, setExperienceText] = useState('')
  const [savingExperience, setSavingExperience] = useState(false)
  const [questions, setQuestions] = useState<OpportunityQuestion[]>([])
  const [questionDraft, setQuestionDraft] = useState('')
  const [answerDrafts, setAnswerDrafts] = useState<Record<number, string>>({})
  const [answerTypes, setAnswerTypes] = useState<Record<number, 'Alumni' | 'Planning'>>({})
  const [questionBusy, setQuestionBusy] = useState(false)
  const [correctionField, setCorrectionField] = useState('Deadline')
  const [correctionValue, setCorrectionValue] = useState('')
  const [correctionSourceUrl, setCorrectionSourceUrl] = useState('')
  const [correctionNote, setCorrectionNote] = useState('')
  const [correctionBusy, setCorrectionBusy] = useState(false)
  const [correctionNotice, setCorrectionNotice] = useState('')

  useEffect(() => {
    let active = true
    getOpportunity(Number(id)).then((item) => { if (active) setOpportunity(item) })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : 'Could not load this destination.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  useEffect(() => {
    let active = true
    const loadCommunityFeatures = async () => {
      try {
        const [nextExperiences, nextQuestions] = await Promise.all([getExperiences(Number(id)), getOpportunityQuestions(Number(id))])
        if (active) { setExperiences(nextExperiences); setQuestions(nextQuestions) }
      } catch { /* The public destination guide remains usable if experiences are unavailable. */ }
      if (sessionToken && user?.emailVerified) {
        try {
          const nextReminders = await getDeadlineReminders(sessionToken)
          if (active) setReminder(nextReminders.find((item) => item.opportunityId === Number(id)) ?? null)
        } catch { /* Reminder controls will show a sign-in or verification hint when used. */ }
      }
    }
    void loadCommunityFeatures()
    return () => { active = false }
  }, [id, sessionToken, user?.emailVerified])

  if (!sessionToken) return <Redirect href="/auth" />

  async function addToPlan() {
    if (!opportunity || !sessionToken) return
    setSaving(true)
    setError('')
    try {
      await createPlan(sessionToken, { opportunityId: opportunity.id, intake: intake.trim() })
      Alert.alert('Added to your plans', `${opportunity.university} · ${intake.trim()} is now in My plans. You can find students going on the same exchange there.`, [
        { text: 'View my plans', onPress: () => router.push('/(tabs)/plans') },
        { text: 'Keep exploring', style: 'cancel' },
      ])
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not add this destination to your plans.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleReminder() {
    if (!opportunity || !sessionToken) return
    if (!user?.emailVerified) { setError('Verify your email before setting email reminders.'); return }
    setError('')
    try {
      if (reminder) {
        await deleteDeadlineReminder(sessionToken, reminder.id)
        setReminder(null)
      } else {
        setReminder(await saveDeadlineReminder(sessionToken, opportunity.id, 7))
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update the deadline reminder.')
    }
  }

  async function submitExperience() {
    if (!opportunity || !sessionToken || experienceText.trim().length < 20) return
    setSavingExperience(true); setError('')
    try {
      await saveExperience(sessionToken, opportunity.id, { rating: experienceRating, experienceType, intake: experienceIntake.trim(), content: experienceText.trim() })
      setExperiences(await getExperiences(opportunity.id))
      setExperienceText('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save your experience.')
    } finally { setSavingExperience(false) }
  }

  async function submitQuestion() {
    if (!opportunity || !sessionToken || !user?.emailVerified || questionDraft.trim().length < 10) return
    setQuestionBusy(true); setError('')
    try {
      await askOpportunityQuestion(sessionToken, opportunity.id, questionDraft.trim())
      setQuestions(await getOpportunityQuestions(opportunity.id))
      setQuestionDraft('')
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not post your question.') }
    finally { setQuestionBusy(false) }
  }

  async function submitAnswer(question: OpportunityQuestion) {
    const content = answerDrafts[question.id]?.trim() ?? ''
    if (!opportunity || !sessionToken || !user?.emailVerified || content.length < 10) return
    setQuestionBusy(true); setError('')
    try {
      await answerOpportunityQuestion(sessionToken, question.id, {
        content, experienceType: answerTypes[question.id] ?? 'Planning',
      })
      setQuestions(await getOpportunityQuestions(opportunity.id))
      setAnswerDrafts((current) => ({ ...current, [question.id]: '' }))
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not send your answer.') }
    finally { setQuestionBusy(false) }
  }

  async function submitCorrection() {
    if (!opportunity || !sessionToken || !user?.emailVerified || !correctionValue.trim() || !correctionSourceUrl.trim() || correctionNote.trim().length < 10) return
    setCorrectionBusy(true); setCorrectionNotice('')
    try {
      await submitCatalogCorrection(sessionToken, opportunity.id, {
        fields: { [correctionField]: correctionValue.trim() },
        sourceUrl: correctionSourceUrl.trim(), note: correctionNote.trim(),
      })
      setCorrectionValue(''); setCorrectionSourceUrl(''); setCorrectionNote('')
      setCorrectionNotice('Thanks. Your source-backed correction is waiting for a review.')
    } catch (caught) { setCorrectionNotice(caught instanceof Error ? caught.message : 'Could not send this correction.') }
    finally { setCorrectionBusy(false) }
  }

  if (loading) return <Page><Loading label="Loading destination details..." /></Page>
  if (!opportunity) return <Page><Pressable onPress={() => router.back()}><Text style={styles.back}>← Back</Text></Pressable><ErrorBanner message={error || 'This destination could not be found.'} /></Page>

  return <Page>
    <Pressable onPress={() => router.back()} style={styles.backRow}><Text style={styles.back}>←  Universities</Text></Pressable>
    <View style={styles.hero}>
      <View style={styles.heroTop}><Text style={styles.countryCode}>{opportunity.country.slice(0, 2).toUpperCase()}</Text><Pill tone={opportunity.verificationStatus === 'Verified' ? 'green' : 'gold'}>{opportunity.verificationStatus === 'Verified' ? 'Source checked' : 'Check details'}</Pill></View>
      <Text style={styles.university}>{opportunity.university}</Text><Text style={styles.city}>{opportunity.city}, {opportunity.country}</Text>
      <View style={styles.tags}>{opportunity.studyFields.slice(0, 3).map((item) => <Pill key={item}>{item}</Pill>)}</View>
      <Text style={styles.verified}>Last checked {formatDate(opportunity.lastVerifiedAt)}</Text>
    </View>

    <View style={styles.financeRow}><Card style={styles.financeCard}><Text style={styles.financeLabel}>MONTHLY GRANT</Text><Text style={styles.financeValue}>{formatEuro(opportunity.monthlyGrant)}</Text><Text style={styles.financeHint}>{opportunity.grantCoveragePercent}% of estimated monthly costs</Text></Card><Card style={styles.financeCard}><Text style={styles.financeLabel}>ESTIMATED MONTHLY BUDGET</Text><Text style={styles.financeValue}>{formatEuro(opportunity.studentBudgetEstimate)}</Text><Text style={styles.financeHint}>Rent and living costs</Text></Card></View>

    <Card><Text style={styles.sectionTitle}>Exchange details</Text><View style={styles.detailsGrid}><Info label="APPLICATION DEADLINE" value={formatDate(opportunity.deadline)} /><Info label="MINIMUM GPA" value={opportunity.minimumGpa.toFixed(1)} /><Info label="DEGREE LEVELS" value={opportunity.levels.join(', ') || 'Check with your coordinator'} /><Info label="TEACHING LANGUAGES" value={opportunity.languages.join(', ') || 'See university website'} /><Info label="ESTIMATED RENT" value={`${formatEuro(opportunity.monthlyRentEstimate)} / mo`} /><Info label="ESTIMATED OTHER COSTS" value={`${formatEuro(opportunity.monthlyLivingEstimate)} / mo`} /></View></Card>

    <Card style={styles.reminderCard}><View style={styles.reminderCopy}><Text style={styles.sectionTitle}>Deadline reminder</Text><Text style={styles.body}>{reminder ? `Email reminder set for ${reminder.daysBefore} days before the listed deadline.` : user?.emailVerified ? 'Get one email 7 days before the listed application deadline.' : 'Verify your email to receive an email reminder.'}</Text></View><Button label={reminder ? 'Remove reminder' : user?.emailVerified ? 'Remind me' : 'Verify email'} variant={reminder ? 'secondary' : 'outline'} compact onPress={() => { void toggleReminder() }} /></Card>
    <Button label="Plan my monthly budget →" variant="secondary" onPress={() => router.push({ pathname: '/budget', params: { opportunityId: String(opportunity.id) } })} />

    <Card><Text style={styles.sectionTitle}>Application checklist</Text>{opportunity.applicationDocuments.map((document, index) => <View key={`${document}-${index}`} style={styles.listRow}><Text style={styles.check}>✓</Text><Text style={styles.listText}>{document}</Text></View>)}</Card>
    {opportunity.studentExperience ? <Card><Text style={styles.sectionTitle}>What to expect</Text><Text style={styles.body}>{opportunity.studentExperience}</Text></Card> : null}
    <Card style={styles.experienceCard}><View style={styles.experienceHeader}><View><Text style={styles.sectionTitle}>Student experiences</Text><Text style={styles.body}>{experiences?.count ? `${experiences.averageRating.toFixed(1)} / 5 · ${experiences.count} shared experiences` : 'No student experiences yet.'}</Text></View><Text style={styles.star}>★</Text></View><Text style={styles.disclosure}>Community contributions. “Alumni” is self-reported, not independently verified.</Text>
      {experiences?.experiences.map((item) => <View key={item.id} style={styles.experienceItem}><View style={styles.experienceTop}><View style={{ flex: 1 }}><Text style={styles.experienceName}>{item.displayName}</Text><Text style={styles.experienceMeta}>{item.experienceType} · {item.intake}</Text></View><Text style={styles.starText}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</Text></View><Text style={styles.body}>{item.content}</Text></View>)}
      {user?.emailVerified ? <View style={styles.experienceForm}><Text style={styles.sectionEyebrow}>SHARE YOUR EXPERIENCE</Text><View style={styles.choiceRow}>{(['Planning', 'Alumni'] as const).map((item) => <Pressable key={item} onPress={() => setExperienceType(item)} style={[styles.choice, experienceType === item && styles.choiceActive]}><Text style={[styles.choiceText, experienceType === item && styles.choiceTextActive]}>{item}</Text></Pressable>)}</View><View style={styles.ratingRow}>{[1, 2, 3, 4, 5].map((value) => <Pressable key={value} onPress={() => setExperienceRating(value)}><Text style={styles.ratingStar}>{value <= experienceRating ? '★' : '☆'}</Text></Pressable>)}</View><Field label="EXCHANGE INTAKE" value={experienceIntake} onChangeText={setExperienceIntake} maxLength={40} /><Field label="YOUR STORY (20–1,500 CHARACTERS)" value={experienceText} onChangeText={setExperienceText} multiline maxLength={1500} /><Button label={savingExperience ? 'Saving…' : 'Share experience'} onPress={() => { void submitExperience() }} disabled={experienceText.trim().length < 20 || !experienceIntake.trim()} loading={savingExperience} compact /></View> : <Text style={styles.body}>Sign in and verify your email to share an experience.</Text>}
    </Card>
    <Card style={styles.mentorshipCard}><Text style={styles.sectionEyebrow}>ALUMNI Q&amp;A</Text><Text style={styles.sectionTitle}>Ask someone who has been there</Text><Text style={styles.body}>Ask about applying, courses, housing, or student life. Alumni labels are self-reported.</Text>
      {questions.length === 0 ? <Text style={styles.disclosure}>No questions yet. Start the conversation for this destination.</Text> : questions.map((question) => <View key={question.id} style={styles.questionBlock}><Text style={styles.questionAuthor}>{question.displayName}</Text><Text style={styles.questionText}>{question.content}</Text>{question.answers.map((answer) => <View key={answer.id} style={styles.answerBlock}><View style={styles.experienceTop}><Text style={styles.experienceName}>{answer.displayName}</Text><Pill tone={answer.experienceType === 'Alumni' ? 'gold' : 'neutral'}>{answer.experienceType}</Pill></View><Text style={styles.body}>{answer.content}</Text></View>)}
        {user?.emailVerified ? <View style={styles.answerForm}><View style={styles.choiceRow}>{(['Planning', 'Alumni'] as const).map((kind) => <Pressable key={kind} onPress={() => setAnswerTypes((current) => ({ ...current, [question.id]: kind }))} style={[styles.choice, (answerTypes[question.id] ?? 'Planning') === kind && styles.choiceActive]}><Text style={[styles.choiceText, (answerTypes[question.id] ?? 'Planning') === kind && styles.choiceTextActive]}>{kind}</Text></Pressable>)}</View><Field label="YOUR ANSWER" value={answerDrafts[question.id] ?? ''} onChangeText={(value) => setAnswerDrafts((current) => ({ ...current, [question.id]: value }))} multiline maxLength={1200} /><Button label="Post answer" onPress={() => { void submitAnswer(question) }} loading={questionBusy} disabled={(answerDrafts[question.id] ?? '').trim().length < 10} compact /></View> : null}
      </View>)}
      {user?.emailVerified ? <View style={styles.questionForm}><Field label="ASK A QUESTION" value={questionDraft} onChangeText={setQuestionDraft} placeholder="What should I know about this destination?" multiline maxLength={500} /><Button label="Ask question" onPress={() => { void submitQuestion() }} loading={questionBusy} disabled={questionDraft.trim().length < 10} compact /></View> : <Text style={styles.disclosure}>Sign in and verify your email to ask or answer questions.</Text>}
    </Card>
    <Card style={styles.correctionCard}><Text style={styles.sectionEyebrow}>CATALOGUE FEEDBACK</Text><Text style={styles.sectionTitle}>See a detail that needs updating?</Text><Text style={styles.body}>Send the correct value with an official university source for review.</Text><View style={styles.choiceRow}>{['Deadline', 'City', 'MinimumGpa', 'MonthlyGrant', 'Languages'].map((field) => <Pressable key={field} onPress={() => setCorrectionField(field)} style={[styles.choice, correctionField === field && styles.choiceActive]}><Text style={[styles.choiceText, correctionField === field && styles.choiceTextActive]}>{field}</Text></Pressable>)}</View><Field label="CORRECT VALUE" value={correctionValue} onChangeText={setCorrectionValue} placeholder={correctionField === 'Deadline' ? 'YYYY-MM-DD' : 'Verified value'} maxLength={300} /><Field label="OFFICIAL SOURCE URL (HTTPS)" value={correctionSourceUrl} onChangeText={setCorrectionSourceUrl} autoCapitalize="none" keyboardType="url" maxLength={500} /><Field label="WHY DOES THIS NEED UPDATING?" value={correctionNote} onChangeText={setCorrectionNote} multiline maxLength={700} /><Button label={correctionBusy ? 'Sending…' : 'Send for review'} onPress={() => { void submitCorrection() }} loading={correctionBusy} disabled={!user?.emailVerified || correctionValue.trim().length === 0 || correctionSourceUrl.trim().length === 0 || correctionNote.trim().length < 10} compact />{correctionNotice ? <Text style={styles.disclosure}>{correctionNotice}</Text> : !user?.emailVerified ? <Text style={styles.disclosure}>Sign in and verify your email to send a correction.</Text> : null}</Card>
    {opportunity.accommodationLinks.length ? <Card><Text style={styles.sectionTitle}>Accommodation resources</Text>{opportunity.accommodationLinks.map((link) => <Pressable key={link.url} onPress={() => void Linking.openURL(link.url)} style={styles.resource}><View style={{ flex: 1, gap: 3 }}><Text style={styles.resourceName}>{link.name}  ↗</Text><Text style={styles.resourceNote}>{link.note}</Text></View></Pressable>)}</Card> : null}

    <Card style={styles.planCard}><Text style={styles.sectionEyebrow}>MAKE IT REAL</Text><Text style={styles.sectionTitle}>Planning to study here?</Text><Text style={styles.body}>Add this destination and your intake to find students making the same move.</Text><Field label="EXCHANGE TERM" value={intake} onChangeText={setIntake} placeholder="Autumn 2026/27" maxLength={40} /><Button label="Add to my plans" onPress={addToPlan} loading={saving} /></Card>
    {error ? <ErrorBanner message={error} /> : null}
    <Pressable onPress={() => void Linking.openURL(opportunity.sourceUrl)}><Text style={styles.source}>Open original university source ↗</Text></Pressable>
  </Page>
}

function Info({ label, value }: { label: string; value: string }) {
  return <View style={styles.info}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>
}

const styles = StyleSheet.create({
  backRow: { alignSelf: 'flex-start', paddingVertical: 3 },
  back: { color: colors.greenDark, fontSize: 13, fontWeight: '700' },
  hero: { backgroundColor: colors.greenDark, borderRadius: radius.large, padding: 20, gap: 9 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countryCode: { color: colors.gold, fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  university: { color: '#FFFFFF', fontSize: 27, lineHeight: 31, fontWeight: '800', letterSpacing: -0.6, marginTop: 5 },
  city: { color: '#C7DDD4', fontSize: 13 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 3 },
  verified: { color: '#9FBFB2', fontSize: 10, marginTop: 2 },
  financeRow: { flexDirection: 'row', gap: 10 },
  financeCard: { flex: 1, padding: 14, gap: 6 },
  financeLabel: { color: colors.muted, fontSize: 8, fontWeight: '800', letterSpacing: 0.7 },
  financeValue: { color: colors.greenDark, fontSize: 19, fontWeight: '800' },
  financeHint: { color: colors.muted, fontSize: 10, lineHeight: 15 },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 15, columnGap: 10 },
  info: { width: '47%', gap: 4 },
  infoLabel: { color: '#87938E', fontSize: 8, fontWeight: '800', letterSpacing: 0.6 },
  infoValue: { color: colors.ink, fontSize: 12, lineHeight: 17, fontWeight: '600' },
  listRow: { flexDirection: 'row', gap: 9, alignItems: 'flex-start' },
  check: { color: colors.green, fontSize: 14, fontWeight: '900' },
  listText: { color: colors.ink, fontSize: 12, lineHeight: 18, flex: 1 },
  body: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  resource: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.line },
  resourceName: { color: colors.greenDark, fontWeight: '800', fontSize: 13 },
  resourceNote: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  planCard: { backgroundColor: '#EEF4EB', borderColor: '#DCE9DE' },
  reminderCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' },
  reminderCopy: { flex: 1, minWidth: 190, gap: 5 },
  experienceCard: { gap: 12 },
  experienceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  star: { color: '#D19A39', fontSize: 23 },
  disclosure: { color: colors.muted, fontSize: 10, lineHeight: 15 },
  experienceItem: { paddingVertical: 11, borderTopWidth: 1, borderTopColor: colors.line, gap: 8 },
  experienceTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  experienceName: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  experienceMeta: { color: colors.muted, fontSize: 9, marginTop: 3 },
  starText: { color: '#D19A39', fontSize: 12 },
  experienceForm: { gap: 10, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 13 },
  mentorshipCard: { gap: 12 },
  questionBlock: { paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line, gap: 7 },
  questionAuthor: { color: colors.greenDark, fontSize: 11, fontWeight: '800' },
  questionText: { color: colors.ink, fontSize: 13, lineHeight: 19, fontWeight: '600' },
  answerBlock: { marginLeft: 10, padding: 11, borderRadius: 13, backgroundColor: '#F2F6F2', gap: 7 },
  answerForm: { marginLeft: 10, gap: 9, paddingTop: 5 },
  questionForm: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12, gap: 9 },
  correctionCard: { gap: 12 },
  choiceRow: { flexDirection: 'row', gap: 8 },
  choice: { paddingVertical: 7, paddingHorizontal: 11, borderWidth: 1, borderColor: colors.line, borderRadius: radius.pill },
  choiceActive: { backgroundColor: colors.mint, borderColor: colors.green },
  choiceText: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  choiceTextActive: { color: colors.greenDark },
  ratingRow: { flexDirection: 'row', gap: 7 },
  ratingStar: { color: '#D19A39', fontSize: 23 },
  sectionEyebrow: { color: colors.green, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  source: { color: colors.green, fontWeight: '700', textAlign: 'center', fontSize: 12, paddingVertical: 4 },
})
