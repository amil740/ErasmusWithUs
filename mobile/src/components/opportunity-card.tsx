import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { Opportunity } from '../lib/types'
import { colors, radius } from '../lib/theme'
import { formatDate, formatEuro } from '../lib/format'
import { Pill } from './ui'

export function OpportunityCard({ opportunity, onPress }: { opportunity: Opportunity; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
    <View style={styles.top}><View style={styles.badge}><Text style={styles.badgeText}>{opportunity.country.slice(0, 2).toUpperCase()}</Text></View><View style={styles.topText}><Text style={styles.name} numberOfLines={1}>{opportunity.university}</Text><Text style={styles.location}>{opportunity.city}, {opportunity.country}</Text></View><Text style={styles.arrow}>↗</Text></View>
    <View style={styles.tags}><Pill>{opportunity.studyFields[0] ?? 'Exchange'}</Pill><Pill tone="gold">{opportunity.levels[0] ?? 'All levels'}</Pill></View>
    <View style={styles.bottom}><View><Text style={styles.metaLabel}>MONTHLY GRANT</Text><Text style={styles.grant}>{formatEuro(opportunity.monthlyGrant)}<Text style={styles.month}> / mo</Text></Text></View><View style={styles.deadline}><Text style={styles.metaLabel}>APPLICATION</Text><Text style={styles.date}>{formatDate(opportunity.deadline)}</Text></View></View>
  </Pressable>
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: radius.medium, padding: 16, borderColor: colors.line, borderWidth: 1, gap: 14 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.995 }] },
  top: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  badge: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenDark },
  badgeText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12, letterSpacing: 0.5 },
  topText: { flex: 1, gap: 3 },
  name: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  location: { color: colors.muted, fontSize: 12 },
  arrow: { fontSize: 20, color: colors.green, fontWeight: '700' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  bottom: { paddingTop: 12, borderTopColor: colors.line, borderTopWidth: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 },
  metaLabel: { color: '#899590', fontSize: 9, letterSpacing: 0.8, fontWeight: '800', marginBottom: 4 },
  grant: { color: colors.greenDark, fontSize: 17, fontWeight: '800' },
  month: { color: colors.muted, fontSize: 10, fontWeight: '500' },
  deadline: { alignItems: 'flex-end' },
  date: { color: colors.ink, fontSize: 11, fontWeight: '700' },
})
