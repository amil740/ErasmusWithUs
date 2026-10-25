import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Avatar, Button, Card, ErrorBanner, Loading, Page, PageHeading, Pill } from '../../components/ui'
import { OpportunityCard } from '../../components/opportunity-card'
import { getOpportunities } from '../../lib/api'
import { colors, radius } from '../../lib/theme'
import type { Opportunity } from '../../lib/types'
import { useAuth } from '../../providers/auth-provider'

export default function ExploreScreen() {
  const { user } = useAuth()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getOpportunities().then((result) => { if (active) setOpportunities(result) })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : 'Could not load opportunities.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return <Page>
    <View style={styles.topbar}><View style={styles.brand}><View style={styles.mark}><Text style={styles.markText}>E</Text></View><Text style={styles.brandText}>erasmus<Text style={{ color: colors.green }}>with</Text>us</Text></View><Pressable onPress={() => router.push('/(tabs)/profile')}><Avatar uri={user?.profilePhotoDataUrl} name={user?.displayName ?? 'Student'} size={40} /></Pressable></View>
    <View style={styles.hero}>
      <View style={styles.heroContent}><Pill tone="gold">YOUR EXCHANGE, WITH A HEAD START</Pill><Text style={styles.heroTitle}>A semester{ '\n' }that takes you{ '\n' }somewhere.</Text><Text style={styles.heroBody}>Find a university, see the real numbers, and meet people headed the same way.</Text><Button label="Explore universities  →" onPress={() => router.push('/(tabs)/universities')} compact style={styles.heroButton} /></View>
      <View pointerEvents="none" style={styles.sun}><Text style={styles.sunIcon}>✦</Text></View>
      <Text style={styles.heroNote}>THE WORLD IS YOUR CAMPUS</Text>
    </View>
    <View style={styles.stats}><View style={styles.stat}><Text style={styles.statNumber}>{opportunities.length || '—'}</Text><Text style={styles.statLabel}>DESTINATIONS</Text></View><View style={styles.statRule} /><View style={styles.stat}><Text style={styles.statNumber}>30+</Text><Text style={styles.statLabel}>COUNTRIES</Text></View><View style={styles.statRule} /><View style={styles.stat}><Text style={styles.statNumber}>1</Text><Text style={styles.statLabel}>COMMUNITY</Text></View></View>

    <Card style={styles.profileCard}><View style={styles.profileCopy}><Text style={styles.sectionEyebrow}>START WITH YOU</Text><Text style={styles.profileTitle}>Build your exchange profile</Text><Text style={styles.profileSubtitle}>Add your field and term to help other students find you.</Text></View><Pressable onPress={() => router.push('/(tabs)/profile')} style={styles.profileAction}><Text style={styles.profileArrow}>↗</Text></Pressable></Card>

    <Pressable onPress={() => router.push('/match')} style={({ pressed }) => [styles.matchCard, pressed && { opacity: 0.82 }]}><View style={styles.matchMark}><Text style={styles.matchMarkText}>✦</Text></View><View style={styles.matchCopy}><Text style={styles.matchEyebrow}>PERSONALIZED FOR YOU</Text><Text style={styles.matchTitle}>Find your best match</Text><Text style={styles.matchSubtitle}>Compare study fit, costs and grants across destinations.</Text></View><Text style={styles.matchArrow}>→</Text></Pressable>

    <PageHeading eyebrow="A few places to begin" title="Featured destinations" subtitle="Real exchange options, all in one place." action={<Pressable onPress={() => router.push('/(tabs)/universities')}><Text style={styles.seeAll}>See all →</Text></Pressable>} />
    {error ? <ErrorBanner message={error} onRetry={() => { setLoading(true); setError(''); void getOpportunities().then(setOpportunities).catch((caught) => setError(caught instanceof Error ? caught.message : 'Could not load opportunities.')).finally(() => setLoading(false)) }} /> : null}
    {loading ? <Loading label="Finding exchange destinations..." /> : opportunities.slice(0, 4).map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} onPress={() => router.push(`/opportunity/${opportunity.id}`)} />)}
    {!loading && opportunities.length === 0 && !error ? <Card><Text style={styles.emptyCopy}>New destinations are being added. Please check back soon.</Text></Card> : null}
  </Page>
}

const styles = StyleSheet.create({
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 1 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  mark: { width: 33, height: 33, borderRadius: 12, backgroundColor: colors.greenDark, justifyContent: 'center', alignItems: 'center' },
  markText: { color: 'white', fontSize: 19, fontWeight: '900', fontStyle: 'italic' },
  brandText: { fontSize: 16, color: colors.ink, fontWeight: '800', letterSpacing: -0.5 },
  hero: { minHeight: 276, backgroundColor: colors.greenDark, borderRadius: radius.large, padding: 22, overflow: 'hidden', justifyContent: 'center' },
  heroContent: { maxWidth: 300, gap: 8, zIndex: 1 },
  heroTitle: { color: '#FFFFFF', fontSize: 34, lineHeight: 36, letterSpacing: -1.1, fontWeight: '800', marginTop: 6 },
  heroBody: { maxWidth: 255, color: '#CEE1DA', fontSize: 12, lineHeight: 18, marginBottom: 4 },
  heroButton: { alignSelf: 'flex-start', backgroundColor: colors.gold, minHeight: 40, marginTop: 2 },
  sun: { position: 'absolute', width: 180, height: 180, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.06)', right: -63, top: 30, alignItems: 'center', justifyContent: 'center' },
  sunIcon: { color: colors.gold, fontSize: 66, marginTop: -12 },
  heroNote: { color: '#9FBFB2', position: 'absolute', bottom: 16, right: 18, fontSize: 8, letterSpacing: 1.2, fontWeight: '800' },
  stats: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 17, borderWidth: 1, borderColor: colors.line, paddingVertical: 13, paddingHorizontal: 9 },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statNumber: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  statLabel: { color: colors.muted, fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
  statRule: { height: 30, width: 1, backgroundColor: colors.line },
  profileCard: { backgroundColor: '#F2EBDC', borderColor: '#EFE6D4', alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  profileCopy: { flex: 1, gap: 5 },
  sectionEyebrow: { color: '#957747', fontWeight: '800', letterSpacing: 1.1, fontSize: 9 },
  profileTitle: { color: colors.ink, fontWeight: '800', fontSize: 15 },
  profileSubtitle: { color: '#6D6A61', fontSize: 11, lineHeight: 16, maxWidth: 235 },
  profileAction: { width: 37, height: 37, borderRadius: 19, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  profileArrow: { color: colors.greenDark, fontSize: 20, fontWeight: '700' },
  seeAll: { color: colors.green, fontSize: 12, fontWeight: '800' },
  emptyCopy: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  matchCard: { backgroundColor: '#E3EEE7', borderRadius: radius.medium, borderWidth: 1, borderColor: '#D7E5DB', padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  matchMark: { width: 38, height: 38, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  matchMarkText: { color: colors.coral, fontSize: 21 },
  matchCopy: { flex: 1, gap: 3 },
  matchEyebrow: { color: colors.green, fontSize: 8, fontWeight: '800', letterSpacing: 0.9 },
  matchTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  matchSubtitle: { color: colors.muted, fontSize: 10, lineHeight: 15 },
  matchArrow: { color: colors.greenDark, fontSize: 20, fontWeight: '800' },
})
