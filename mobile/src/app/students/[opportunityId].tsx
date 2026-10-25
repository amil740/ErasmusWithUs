import { useCallback, useEffect, useState } from 'react'
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native'
import { Redirect, router, useLocalSearchParams } from 'expo-router'
import { Avatar, Button, Card, EmptyState, ErrorBanner, Loading, Page, PageHeading, Pill } from '../../components/ui'
import { getStudents, startConversation } from '../../lib/api'
import { colors } from '../../lib/theme'
import type { CommunityStudent } from '../../lib/types'
import { useAuth } from '../../providers/auth-provider'

export default function StudentsGoingScreen() {
  const { opportunityId: rawId, intake: rawIntake, university: rawUniversity } = useLocalSearchParams<{ opportunityId: string; intake?: string; university?: string }>()
  const opportunityId = Number(rawId)
  const intake = typeof rawIntake === 'string' ? rawIntake : ''
  const university = typeof rawUniversity === 'string' ? rawUniversity : 'Your exchange destination'
  const { token } = useAuth()
  const sessionToken = token ?? ''
  const [students, setStudents] = useState<CommunityStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [openingId, setOpeningId] = useState<number | null>(null)
  const [roommatesOnly, setRoommatesOnly] = useState(false)

  const loadStudents = useCallback(async () => {
    if (!sessionToken || !opportunityId || !intake) return
    try {
      const nextStudents = await getStudents(sessionToken, opportunityId, intake, roommatesOnly)
      setStudents(nextStudents)
      setError('')
    }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not load students.') }
    finally { setLoading(false) }
  }, [sessionToken, opportunityId, intake, roommatesOnly])

  useEffect(() => {
    if (!sessionToken || !opportunityId || !intake) return
    let active = true
    getStudents(sessionToken, opportunityId, intake, roommatesOnly)
      .then((nextStudents) => { if (active) { setStudents(nextStudents); setError('') } })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : 'Could not load students.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [sessionToken, opportunityId, intake, roommatesOnly])
  if (!sessionToken) return <Redirect href="/auth" />

  async function messageStudent(student: CommunityStudent) {
    setOpeningId(student.id)
    try {
      const result = await startConversation(sessionToken, { recipientUserId: student.id, opportunityId, intake })
      router.push(`/conversation/${result.conversationId}`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not start the conversation.')
    } finally {
      setOpeningId(null)
    }
  }

  return <Page>
    <Pressable onPress={() => router.back()}><Text style={styles.back}>←  My plans</Text></Pressable>
    <PageHeading eyebrow="Your exchange circle" title="Students going" subtitle={`${university} · ${intake}. Connect with students who share your destination and term.`} />
    <Card style={styles.banner}><Text style={styles.bannerIcon}>✦</Text><Text style={styles.bannerText}>These students have chosen the same exchange destination and intake as you.</Text></Card>
    <Card style={styles.roommateFilter}><View style={{ flex: 1, gap: 3 }}><Text style={styles.filterTitle}>Roommate search</Text><Text style={styles.filterCopy}>Only students open to shared housing</Text></View><Switch value={roommatesOnly} onValueChange={setRoommatesOnly} trackColor={{ false: '#D6DEDA', true: colors.green }} thumbColor="#FFFFFF" /></Card>
    {error ? <ErrorBanner message={error} onRetry={() => { setLoading(true); void loadStudents() }} /> : null}
    {loading ? <Loading label="Finding your exchange circle..." /> : students.map((student) => <Card key={student.id} style={styles.studentCard}>
      <View style={styles.studentTop}><Avatar uri={student.profilePhotoDataUrl} name={student.displayName} size={54} /><View style={styles.studentCopy}><Text style={styles.studentName}>{student.displayName}</Text><Text style={styles.studentUniversity}>{student.homeUniversity || 'University not added'}</Text></View><Pill tone="gold">{student.level || 'Student'}</Pill></View>
      <View style={styles.pills}>{student.studyField ? <Pill>{student.studyField}</Pill> : null}<Pill tone="neutral">{intake}</Pill>{student.roommateSearch ? <Pill tone="gold">Open to a roommate</Pill> : null}</View>
      {student.bio ? <Text style={styles.bio}>{student.bio}</Text> : <Text style={styles.bioMuted}>Ready to meet another student heading to {university}.</Text>}
      <Button label={openingId === student.id ? 'Opening chat...' : 'Say hello'} onPress={() => messageStudent(student)} loading={openingId === student.id} compact />
    </Card>)}
    {!loading && !error && students.length === 0 ? <Card><EmptyState icon="✦" title="Your exchange circle is waiting" detail="No visible students have chosen this destination yet. Keep community visibility on in your profile, then check again later." /></Card> : null}
  </Page>
}

const styles = StyleSheet.create({
  back: { color: colors.greenDark, fontWeight: '700', fontSize: 13, paddingVertical: 3 },
  banner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2EBDC', borderColor: '#EFE6D4', gap: 11 },
  bannerIcon: { color: '#AD8847', fontSize: 23 },
  bannerText: { color: '#665D4A', fontSize: 11, lineHeight: 17, flex: 1 },
  roommateFilter: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  filterTitle: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  filterCopy: { color: colors.muted, fontSize: 10, lineHeight: 15 },
  studentCard: { gap: 13 },
  studentTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  studentCopy: { flex: 1, gap: 3 },
  studentName: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  studentUniversity: { color: colors.muted, fontSize: 11 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  bio: { color: colors.ink, fontSize: 12, lineHeight: 18 },
  bioMuted: { color: colors.muted, fontSize: 12, lineHeight: 18 },
})
