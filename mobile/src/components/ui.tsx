import { Image } from 'expo-image'
import type { ReactNode } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, radius } from '../lib/theme'

export function Page({ children, scroll = true, contentStyle }: { children: ReactNode; scroll?: boolean; contentStyle?: ViewStyle }) {
  return <SafeAreaView style={styles.page} edges={['top', 'left', 'right']}>
    {scroll ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.pageContent, contentStyle]}>{children}</ScrollView> : <View style={[styles.pageContent, { flex: 1 }, contentStyle]}>{children}</View>}
  </SafeAreaView>
}

export function PageHeading({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle?: string; action?: ReactNode }) {
  return <View style={styles.headingRow}><View style={styles.headingText}>{eyebrow ? <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text> : null}<Text style={styles.title}>{title}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View>{action}</View>
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>
}

export function Button({ label, onPress, variant = 'primary', disabled = false, loading = false, compact = false, style }: {
  label: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'outline' | 'danger'; disabled?: boolean; loading?: boolean; compact?: boolean; style?: ViewStyle
}) {
  const background = variant === 'primary' ? colors.greenDark : variant === 'danger' ? '#FFF1EE' : variant === 'secondary' ? colors.mint : 'transparent'
  const foreground = variant === 'primary' ? '#FFFFFF' : variant === 'danger' ? colors.danger : colors.greenDark
  return <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [styles.button, compact && styles.buttonCompact, { backgroundColor: background, opacity: disabled ? 0.55 : pressed ? 0.83 : 1 }, variant === 'outline' && styles.buttonOutline, style]}>
    {loading ? <ActivityIndicator color={foreground} /> : <Text style={[styles.buttonText, { color: foreground }]}>{label}</Text>}
  </Pressable>
}

export function Field({ label, wrapperStyle, multiline, ...props }: TextInputProps & { label: string; wrapperStyle?: ViewStyle }) {
  return <View style={[styles.fieldWrap, wrapperStyle]}><Text style={styles.fieldLabel}>{label}</Text><TextInput placeholderTextColor="#8A9894" {...props} multiline={multiline} style={[styles.input, multiline && styles.multiline, props.style]} /></View>
}

export function Pill({ children, tone = 'green' }: { children: ReactNode; tone?: 'green' | 'gold' | 'neutral' }) {
  const colorsByTone = tone === 'gold' ? { bg: '#FFF3D8', fg: '#865B16' } : tone === 'neutral' ? { bg: '#EFF2EF', fg: '#596662' } : { bg: colors.mint, fg: colors.greenDark }
  return <View style={[styles.pill, { backgroundColor: colorsByTone.bg }]}><Text style={[styles.pillText, { color: colorsByTone.fg }]}>{children}</Text></View>
}

export function Avatar({ uri, name, size = 48 }: { uri?: string | null; name: string; size?: number }) {
  const initial = name.trim().slice(0, 1).toUpperCase() || '?'
  if (uri) return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.mint }} contentFit="cover" />
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.greenDark, fontWeight: '800', fontSize: size * 0.38 }}>{initial}</Text></View>
}

export function Loading({ label = 'Loading...' }: { label?: string }) {
  return <View style={styles.loading}><ActivityIndicator color={colors.green} /><Text style={styles.loadingText}>{label}</Text></View>
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <View style={styles.errorBox}><Text style={styles.errorText}>{message}</Text>{onRetry ? <Pressable onPress={onRetry}><Text style={styles.retry}>Try again</Text></Pressable> : null}</View>
}

export function EmptyState({ icon, title, detail, action }: { icon: string; title: string; detail: string; action?: ReactNode }) {
  return <View style={styles.empty}><Text style={styles.emptyIcon}>{icon}</Text><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyDetail}>{detail}</Text>{action}</View>
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  pageContent: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 36, gap: 16 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 2 },
  headingText: { flex: 1, gap: 3 },
  eyebrow: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: colors.ink, fontSize: 27, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 2 },
  card: { padding: 17, borderRadius: radius.medium, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, gap: 12 },
  button: { minHeight: 48, paddingHorizontal: 17, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  buttonCompact: { minHeight: 38, paddingHorizontal: 13 },
  buttonOutline: { borderWidth: 1, borderColor: colors.line },
  buttonText: { fontSize: 14, fontWeight: '700' },
  fieldWrap: { gap: 7 },
  fieldLabel: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.line, borderRadius: 13, paddingHorizontal: 14, color: colors.ink, backgroundColor: '#FFFFFF', fontSize: 14 },
  multiline: { minHeight: 96, paddingVertical: 12, textAlignVertical: 'top' },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  pillText: { fontSize: 11, fontWeight: '700' },
  loading: { minHeight: 150, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: colors.muted, fontSize: 13 },
  errorBox: { padding: 15, borderRadius: 14, backgroundColor: '#FFF0EE', gap: 8 },
  errorText: { color: '#86382F', fontSize: 13, lineHeight: 19 },
  retry: { color: colors.greenDark, fontWeight: '800' },
  empty: { alignItems: 'center', paddingVertical: 34, paddingHorizontal: 22, gap: 9 },
  emptyIcon: { fontSize: 30, marginBottom: 3 },
  emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  emptyDetail: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
})
