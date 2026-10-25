import { useEffect, useMemo, useState } from 'react'
import * as SecureStore from 'expo-secure-store'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { Card, ErrorBanner, Field, Loading, Page, PageHeading, Pill } from '../components/ui'
import { getOpportunities } from '../lib/api'
import { formatEuro } from '../lib/format'
import { colors } from '../lib/theme'
import type { Opportunity } from '../lib/types'

export default function BudgetScreen() {
  const { opportunityId } = useLocalSearchParams<{ opportunityId?: string }>()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [selectedId, setSelectedId] = useState(Number(opportunityId) || 0)
  const [rent, setRent] = useState('')
  const [living, setLiving] = useState('')
  const [extras, setExtras] = useState('0')
  const [moveIn, setMoveIn] = useState('0')
  const [funds, setFunds] = useState('500')
  const [loadedBudgetFor, setLoadedBudgetFor] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const selected = opportunities.find((item) => item.id === selectedId) ?? opportunities[0]

  useEffect(() => {
    let active = true
    getOpportunities().then((items) => {
      if (!active) return
      setOpportunities(items)
      const requested = items.find((item) => item.id === Number(opportunityId)) ?? items[0]
      if (requested) {
        setSelectedId(requested.id)
        setRent(String(requested.monthlyRentEstimate))
        setLiving(String(requested.monthlyLivingEstimate))
      }
    }).catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : 'Could not load destinations.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [opportunityId])

  const selectedIdForBudget = selected?.id

  useEffect(() => {
    if (!selectedIdForBudget) return
    let active = true
    void SecureStore.getItemAsync(`erasmuswithus.budget.${selectedIdForBudget}`).then((saved) => {
      if (!active || !saved) return
      try {
        const values = JSON.parse(saved) as { rent?: number; living?: number; extras?: number; moveIn?: number; funds?: number }
        if (values.rent !== undefined) setRent(String(values.rent))
        if (values.living !== undefined) setLiving(String(values.living))
        if (values.extras !== undefined) setExtras(String(values.extras))
        if (values.moveIn !== undefined) setMoveIn(String(values.moveIn))
        if (values.funds !== undefined) setFunds(String(values.funds))
      } catch { /* Ignore an old or incomplete local budget record. */ }
    }).catch(() => undefined).finally(() => { if (active) setLoadedBudgetFor(selectedIdForBudget) })
    return () => { active = false }
  }, [selectedIdForBudget])

  useEffect(() => {
    if (!selectedIdForBudget || loadedBudgetFor !== selectedIdForBudget) return
    void SecureStore.setItemAsync(`erasmuswithus.budget.${selectedIdForBudget}`, JSON.stringify({
      rent: Number(rent) || 0, living: Number(living) || 0, extras: Number(extras) || 0,
      moveIn: Number(moveIn) || 0, funds: Number(funds) || 0,
    })).catch(() => undefined)
  }, [selectedIdForBudget, loadedBudgetFor, rent, living, extras, moveIn, funds])

  const comparison = useMemo(() => [...opportunities]
    .sort((a, b) => (a.studentBudgetEstimate - a.monthlyGrant) - (b.studentBudgetEstimate - b.monthlyGrant))
    .slice(0, 5), [opportunities])

  if (loading) return <Page><Loading label="Loading your budget planner..." /></Page>
  if (!selected) return <Page><PageHeading eyebrow="Monthly planning" title="Budget planner" subtitle="Estimate your costs after the Erasmus grant." />{error ? <ErrorBanner message={error} /> : null}</Page>

  const monthlyCost = Math.max(0, Number(rent) || 0) + Math.max(0, Number(living) || 0) + Math.max(0, Number(extras) || 0)
  const firstMonthGap = Math.max(0, monthlyCost + Math.max(0, Number(moveIn) || 0) - selected.monthlyGrant)
  const afterGap = (Number(funds) || 0) - firstMonthGap

  function cycleDestination() {
    if (!opportunities.length) return
    const index = opportunities.findIndex((item) => item.id === selected.id)
    const next = opportunities[(index + 1) % opportunities.length]
    setSelectedId(next.id)
    setRent(String(next.monthlyRentEstimate))
    setLiving(String(next.monthlyLivingEstimate))
  }

  return <Page>
    <PageHeading eyebrow="Monthly planning" title="Budget planner" subtitle="Use your own housing and living estimates to see the likely monthly gap after the listed grant." action={<Pill tone="gold">EUR / month</Pill>} />
    <Card style={styles.destinationCard}><View style={{ flex: 1, gap: 4 }}><Text style={styles.eyebrow}>CURRENT DESTINATION</Text><Text style={styles.university}>{selected.university}</Text><Text style={styles.city}>{selected.city}, {selected.country}</Text></View><Pressable onPress={cycleDestination} style={styles.switch}><Text style={styles.switchText}>Next →</Text></Pressable></Card>
    <Card><Text style={styles.sectionTitle}>Your monthly figures</Text><Field label="RENT / HOUSING" value={rent} onChangeText={setRent} keyboardType="number-pad" /><Field label="FOOD, TRANSPORT & BASICS" value={living} onChangeText={setLiving} keyboardType="number-pad" /><Field label="OTHER MONTHLY COSTS" value={extras} onChangeText={setExtras} keyboardType="number-pad" /><Field label="ONE-TIME ARRIVAL COSTS & DEPOSIT" value={moveIn} onChangeText={setMoveIn} keyboardType="number-pad" /><Field label="MY FIRST-MONTH FUNDS" value={funds} onChangeText={setFunds} keyboardType="number-pad" /></Card>
    <Card style={styles.summary}><SummaryRow label="Your estimated monthly costs" value={formatEuro(monthlyCost)} /><SummaryRow label="One-time arrival and deposit costs" value={`+ ${formatEuro(Number(moveIn) || 0)}`} /><SummaryRow label="Listed monthly Erasmus grant" value={`− ${formatEuro(selected.monthlyGrant)}`} /><SummaryRow label="First-month amount to cover after grant" value={formatEuro(firstMonthGap)} emphasis={firstMonthGap > 0 ? 'warn' : 'good'} /><SummaryRow label="Your funds after first-month costs" value={afterGap < 0 ? `− ${formatEuro(Math.abs(afterGap))}` : formatEuro(afterGap)} emphasis={afterGap < 0 ? 'warn' : 'good'} /></Card>
    <Text style={styles.disclaimer}>Planning estimate only. Grants, rents and living costs change; confirm your grant and check current housing prices before making financial decisions.</Text>
    <Card><Text style={styles.sectionTitle}>Destinations with smaller estimated gaps</Text><Text style={styles.helper}>Listed monthly cost estimate minus listed grant.</Text>{comparison.map((item) => <Pressable key={item.id} style={styles.compareRow} onPress={() => setSelectedId(item.id)}><View style={{ flex: 1 }}><Text style={styles.compareName}>{item.university}</Text><Text style={styles.city}>{item.city}, {item.country}</Text></View><Text style={styles.compareValue}>{Math.max(0, item.studentBudgetEstimate - item.monthlyGrant) === 0 ? 'Covered in estimate' : formatEuro(item.studentBudgetEstimate - item.monthlyGrant)}</Text></Pressable>)}</Card>
    {error ? <ErrorBanner message={error} /> : null}
  </Page>
}

function SummaryRow({ label, value, emphasis }: { label: string; value: string; emphasis?: 'warn' | 'good' }) {
  return <View style={styles.summaryRow}><Text style={styles.summaryLabel}>{label}</Text><Text style={[styles.summaryValue, emphasis === 'warn' && styles.warning, emphasis === 'good' && styles.positive]}>{value}</Text></View>
}

const styles = StyleSheet.create({
  destinationCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  eyebrow: { color: colors.green, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  university: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  city: { color: colors.muted, fontSize: 10 },
  switch: { minHeight: 36, paddingHorizontal: 12, borderRadius: 20, backgroundColor: colors.mint, justifyContent: 'center' },
  switchText: { color: colors.greenDark, fontSize: 11, fontWeight: '800' },
  sectionTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  summary: { gap: 0 },
  summaryRow: { minHeight: 43, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  summaryLabel: { flex: 1, color: colors.muted, fontSize: 11, lineHeight: 16 },
  summaryValue: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  warning: { color: '#AD6228' },
  positive: { color: colors.green },
  disclaimer: { color: colors.muted, fontSize: 10, lineHeight: 16, paddingHorizontal: 2 },
  helper: { color: colors.muted, fontSize: 10 },
  compareRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.line },
  compareName: { color: colors.ink, fontSize: 11, fontWeight: '800' },
  compareValue: { color: colors.green, fontSize: 11, fontWeight: '800' },
})
