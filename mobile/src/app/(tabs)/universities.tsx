import { useEffect, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { router } from 'expo-router'
import { OpportunityCard } from '../../components/opportunity-card'
import { ErrorBanner, Loading, Page, PageHeading } from '../../components/ui'
import { getCountries, getOpportunities } from '../../lib/api'
import { colors, radius } from '../../lib/theme'
import type { Opportunity } from '../../lib/types'

export default function UniversitiesScreen() {
  const [items, setItems] = useState<Opportunity[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { void getCountries().then(setCountries).catch(() => undefined) }, [])

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      setLoading(true)
      getOpportunities({ search, country }).then((result) => { if (active) setItems(result) })
        .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : 'Could not load universities.') })
        .finally(() => { if (active) setLoading(false) })
    }, 220)
    return () => { active = false; clearTimeout(timer) }
  }, [search, country])

  return <Page>
    <PageHeading eyebrow="Find your next campus" title="Universities" subtitle="Compare destinations, grants, study fields and application dates." />
    <View style={styles.searchBox}><Text style={styles.searchGlyph}>⌕</Text><TextInput value={search} onChangeText={setSearch} placeholder="Search city, university or subject" placeholderTextColor="#8A9894" style={styles.searchInput} returnKeyType="search" /></View>
    <View style={styles.filterRow}><Text style={styles.filterLabel}>COUNTRY</Text><Pressable onPress={() => setCountry('')} style={[styles.filter, !country && styles.filterActive]}><Text style={[styles.filterText, !country && styles.filterTextActive]}>All</Text></Pressable>{countries.slice(0, 6).map((item) => <Pressable key={item} onPress={() => setCountry(country === item ? '' : item)} style={[styles.filter, country === item && styles.filterActive]}><Text style={[styles.filterText, country === item && styles.filterTextActive]}>{item}</Text></Pressable>)}</View>
    <Text style={styles.resultLabel}>{loading ? 'SEARCHING DESTINATIONS' : `${items.length} DESTINATION${items.length === 1 ? '' : 'S'}`}</Text>
    {error ? <ErrorBanner message={error} onRetry={() => { setError(''); setLoading(true); void getOpportunities({ search, country }).then(setItems).catch((caught) => setError(caught instanceof Error ? caught.message : 'Could not load universities.')).finally(() => setLoading(false)) }} /> : null}
    {loading ? <Loading label="Looking across destinations..." /> : items.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} onPress={() => router.push(`/opportunity/${opportunity.id}`)} />)}
    {!loading && !error && !items.length ? <View style={styles.empty}><Text style={styles.emptyTitle}>No destinations found</Text><Text style={styles.emptyCopy}>Try another university, subject or country.</Text></View> : null}
  </Page>
}

const styles = StyleSheet.create({
  searchBox: { height: 50, borderWidth: 1, borderColor: colors.line, borderRadius: radius.pill, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, gap: 9 },
  searchGlyph: { fontSize: 23, color: colors.green, marginTop: -2 },
  searchInput: { flex: 1, color: colors.ink, fontSize: 13, paddingVertical: 0 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 7 },
  filterLabel: { width: '100%', color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.1, marginBottom: 1 },
  filter: { borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 11, paddingVertical: 7, backgroundColor: '#FFFFFF' },
  filterActive: { backgroundColor: colors.greenDark, borderColor: colors.greenDark },
  filterText: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  filterTextActive: { color: '#FFFFFF' },
  resultLabel: { color: colors.muted, letterSpacing: 1.1, fontWeight: '800', fontSize: 9, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 38, gap: 7 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: colors.ink },
  emptyCopy: { fontSize: 12, color: colors.muted },
})
