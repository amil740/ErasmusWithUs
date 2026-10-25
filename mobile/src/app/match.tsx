import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Button, Card, ErrorBanner, Field, Loading, Page, PageHeading, Pill } from '../components/ui'
import { OpportunityCard } from '../components/opportunity-card'
import { getMatches } from '../lib/api'
import { splitList } from '../lib/format'
import { colors } from '../lib/theme'
import type { MatchResult } from '../lib/types'
import { useAuth } from '../providers/auth-provider'

export default function MatchScreen() {
  const { user } = useAuth()
  const [homeUniversity, setHomeUniversity] = useState(user?.homeUniversity ?? '')
  const [intake, setIntake] = useState(user?.intake ?? 'Autumn 2026/27')
  const [country, setCountry] = useState(user?.country ?? '')
  const [studyField, setStudyField] = useState(user?.studyField ?? '')
  const [level, setLevel] = useState(user?.level ?? '')
  const [gpa, setGpa] = useState(user?.gpa?.toString() ?? '3.0')
  const [preferredCountries, setPreferredCountries] = useState(user?.preferredCountries.join(', ') ?? '')
  const [languages, setLanguages] = useState(user?.languages.join(', ') ?? 'English')
  const [budget, setBudget] = useState('600')
  const [matches, setMatches] = useState<MatchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  async function findMatches() {
    setError('')
    setLoading(true)
    const grade = Number(gpa)
    const monthlyBudget = budget.trim() ? Number(budget) : null
    if (!Number.isFinite(grade) || grade < 0 || grade > 4) {
      setLoading(false)
      setError('Enter a GPA from 0 to 4.')
      return
    }
    if (monthlyBudget !== null && (!Number.isFinite(monthlyBudget) || monthlyBudget < 0)) {
      setLoading(false)
      setError('Enter a valid monthly budget, or leave it blank.')
      return
    }
    try {
      const result = await getMatches({
        homeUniversity: homeUniversity.trim() || null,
        intake: intake.trim() || null,
        country: country.trim() || null,
        studyField: studyField.trim() || null,
        level: level.trim() || null,
        gpa: grade,
        preferredCountries: splitList(preferredCountries),
        languages: splitList(languages),
        likes: [],
        dislikes: [],
        budget: monthlyBudget,
      })
      setMatches(result)
      setSearched(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not calculate your matches.')
    } finally {
      setLoading(false)
    }
  }

  return <Page>
    <Pressable onPress={() => router.back()}><Text style={styles.back}>←  Explore</Text></Pressable>
    <PageHeading eyebrow="Better choices start with your priorities" title="Find your match" subtitle="Share what matters to you and get a ranked list of exchange destinations." />
    <Card style={styles.intro}><Text style={styles.introIcon}>✦</Text><Text style={styles.introText}>Your study field, GPA, preferred countries and budget help rank destinations that fit.</Text></Card>
    <Card><Text style={styles.sectionTitle}>Your starting point</Text><Field label="HOME UNIVERSITY" value={homeUniversity} onChangeText={setHomeUniversity} placeholder="Where you study now" /><View style={styles.columns}><Field label="HOME COUNTRY" value={country} onChangeText={setCountry} placeholder="Azerbaijan" wrapperStyle={styles.half} /><Field label="EXCHANGE TERM" value={intake} onChangeText={setIntake} placeholder="Autumn 2026/27" wrapperStyle={styles.half} /></View><Field label="FIELD OF STUDY" value={studyField} onChangeText={setStudyField} placeholder="Computer Science" /><View style={styles.columns}><Field label="DEGREE LEVEL" value={level} onChangeText={setLevel} placeholder="Bachelor" wrapperStyle={styles.half} /><Field label="GPA (0–4)" value={gpa} onChangeText={setGpa} placeholder="3.0" keyboardType="decimal-pad" wrapperStyle={styles.half} /></View></Card>
    <Card><Text style={styles.sectionTitle}>What matters to you</Text><Field label="PREFERRED COUNTRIES" value={preferredCountries} onChangeText={setPreferredCountries} placeholder="Finland, Germany, Spain" /><Text style={styles.helper}>Separate countries with commas. Leave blank to consider all.</Text><Field label="LANGUAGES" value={languages} onChangeText={setLanguages} placeholder="English, German" /><Field label="MONTHLY BUDGET IN EUROS" value={budget} onChangeText={setBudget} placeholder="600" keyboardType="number-pad" /></Card>
    {error ? <ErrorBanner message={error} /> : null}
    <Button label="Show my best matches" onPress={findMatches} loading={loading} />
    {loading ? <Loading label="Comparing destinations for you..." /> : null}
    {searched && !loading ? <>
      <PageHeading eyebrow="Based on your priorities" title="Your top destinations" subtitle={`${matches.length} match${matches.length === 1 ? '' : 'es'} ranked for your exchange.`} />
      {matches.map((match, index) => { const eligibility = match.eligibility; const compatible = Boolean(eligibility?.meetsPublishedRequirements && eligibility.hasEnoughProfileData); return <Card key={match.opportunity.id} style={styles.matchResult}><View style={styles.matchHeading}><View style={styles.rank}><Text style={styles.rankText}>#{index + 1}</Text></View><Pill tone="gold">{match.score}% FIT</Pill></View><OpportunityCard opportunity={match.opportunity} onPress={() => router.push(`/opportunity/${match.opportunity.id}`)} />{match.reasons.length ? <View style={styles.reasons}>{match.reasons.slice(0, 3).map((reason) => <Text style={styles.reason} key={reason}>✓  {reason}</Text>)}</View> : null}<View style={[styles.eligibility, compatible ? styles.eligible : styles.needsCheck]}><Text style={styles.eligibilityTitle}>{eligibility ? compatible ? 'Listed checks look compatible' : 'Review listed requirements' : 'Refresh the API to see eligibility checks'}</Text>{eligibility?.reasons.slice(0, 3).map((reason) => <Text style={styles.eligibilityReason} key={reason}>• {reason}</Text>)}<Text style={styles.eligibilityReason}>Your coordinator must confirm the bilateral agreement and nomination.</Text></View></Card>})}
      {matches.length === 0 ? <Card><Text style={styles.noMatches}>No destination matched those details yet. Try widening your preferred countries or adjusting your profile.</Text></Card> : null}
    </> : null}
  </Page>
}

const styles = StyleSheet.create({
  back: { color: colors.greenDark, fontWeight: '700', fontSize: 13, paddingVertical: 3 },
  intro: { backgroundColor: colors.greenDark, borderColor: colors.greenDark, flexDirection: 'row', alignItems: 'center', gap: 11 },
  introIcon: { color: colors.gold, fontSize: 23 },
  introText: { color: '#D5E5DE', fontSize: 11, lineHeight: 17, flex: 1 },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  columns: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  helper: { color: colors.muted, fontSize: 10, marginTop: -6 },
  matchResult: { gap: 11, padding: 12 },
  matchHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 3 },
  rank: { width: 29, height: 29, borderRadius: 12, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  rankText: { color: colors.greenDark, fontSize: 11, fontWeight: '800' },
  reasons: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10, gap: 5 },
  reason: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  eligibility: { padding: 11, borderRadius: 12, gap: 5 },
  eligible: { backgroundColor: '#EAF5ED' },
  needsCheck: { backgroundColor: '#FFF3D8' },
  eligibilityTitle: { color: colors.greenDark, fontSize: 11, fontWeight: '800' },
  eligibilityReason: { color: colors.muted, fontSize: 10, lineHeight: 15 },
  noMatches: { color: colors.muted, fontSize: 13, lineHeight: 19 },
})
