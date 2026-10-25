import { useEffect, useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { router } from 'expo-router'
import { Button, Field, Pill } from '../components/ui'
import { login, register, requestVerification, verifyEmail } from '../lib/api'
import { colors, radius } from '../lib/theme'
import { useAuth } from '../providers/auth-provider'

type Mode = 'login' | 'register' | 'verify'

export default function AuthScreen() {
  const { user, acceptSession } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => { if (user) router.replace('/(tabs)') }, [user])

  async function submit() {
    setError('')
    setNotice('')
    setBusy(true)
    try {
      const normalizedEmail = email.trim().toLowerCase()
      if (mode === 'verify') {
        await verifyEmail({ email: normalizedEmail, token: code.trim() })
        const result = await login({ email: normalizedEmail, password })
        if (result.verificationRequired) throw new Error('Your email is not verified yet. Check the code and try again.')
        await acceptSession(result.token, result.user)
        return
      }

      const result = mode === 'register'
        ? await register({ email: normalizedEmail, password, displayName: name.trim() })
        : await login({ email: normalizedEmail, password })

      if (result.verificationRequired) {
        setMode('verify')
        setCode(result.verificationCode ?? '')
        setNotice('We sent a verification code to your email. Enter it below to finish setting up your account.')
        return
      }
      await acceptSession(result.token, result.user)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not sign in. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function resendCode() {
    setBusy(true)
    setError('')
    try {
      const result = await requestVerification({ email: email.trim().toLowerCase() })
      if (result.token) setCode(result.token)
      setNotice(result.message || 'If the account needs verification, a new code has been sent.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not send a new code.')
    } finally {
      setBusy(false)
    }
  }

  return <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.brandLine}><View style={styles.brandMark}><Text style={styles.brandMarkText}>E</Text></View><Text style={styles.brandName}>erasmus<Text style={styles.brandAccent}>with</Text>us</Text></View>
      <View style={styles.hero}>
        <Pill tone="gold">YOUR NEXT CHAPTER ABROAD</Pill>
        <Text style={styles.heroTitle}>Find your people.{ '\n' }Find your place.</Text>
        <Text style={styles.heroSubtitle}>Explore exchange destinations and meet the students heading there with you.</Text>
        <View style={styles.orbit}><Text style={styles.orbitIcon}>✦</Text><View style={styles.orbitDot} /></View>
      </View>

      <View style={styles.formCard}>
        {mode !== 'verify' ? <View style={styles.switcher}>
          <Pressable onPress={() => { setMode('login'); setError(''); setNotice('') }} style={[styles.switchTab, mode === 'login' && styles.switchTabActive]}><Text style={[styles.switchText, mode === 'login' && styles.switchTextActive]}>Sign in</Text></Pressable>
          <Pressable onPress={() => { setMode('register'); setError(''); setNotice('') }} style={[styles.switchTab, mode === 'register' && styles.switchTabActive]}><Text style={[styles.switchText, mode === 'register' && styles.switchTextActive]}>Create account</Text></Pressable>
        </View> : <Text style={styles.formTitle}>Verify your email</Text>}
        {mode === 'register' ? <Field label="YOUR NAME" value={name} onChangeText={setName} placeholder="Amil Hasanov" autoCapitalize="words" returnKeyType="next" /> : null}
        <Field label="UNIVERSITY EMAIL" value={email} onChangeText={setEmail} placeholder="you@university.edu" autoCapitalize="none" keyboardType="email-address" returnKeyType="next" editable={mode !== 'verify'} />
        {mode !== 'verify' ? <Field label="PASSWORD" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secureTextEntry returnKeyType="done" onSubmitEditing={submit} /> : <>
          <Field label="VERIFICATION CODE" value={code} onChangeText={setCode} placeholder="Enter the code from your email" keyboardType="number-pad" returnKeyType="done" onSubmitEditing={submit} />
          <Pressable onPress={resendCode} disabled={busy}><Text style={styles.resend}>Send a new code</Text></Pressable>
        </>}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        <Button label={busy ? 'Please wait...' : mode === 'verify' ? 'Verify and continue' : mode === 'register' ? 'Create my account' : 'Continue'} onPress={submit} loading={busy} />
        {mode === 'register' ? <Text style={styles.terms}>By continuing, you agree to keep this community respectful and useful for students.</Text> : null}
      </View>
      {mode === 'verify' ? <Pressable style={styles.backLink} onPress={() => { setMode('login'); setError(''); setNotice('') }}><Text style={styles.backText}>Back to sign in</Text></Pressable> : null}
      <Text style={styles.footer}>Made for the next move.</Text>
    </ScrollView>
  </KeyboardAvoidingView>
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: 510, alignSelf: 'center', padding: 22, paddingTop: 28, paddingBottom: 40, gap: 22 },
  brandLine: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: { width: 38, height: 38, borderRadius: 14, backgroundColor: colors.greenDark, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: 'white', fontSize: 22, fontWeight: '900', fontStyle: 'italic' },
  brandName: { color: colors.ink, fontSize: 19, fontWeight: '800', letterSpacing: -0.8 },
  brandAccent: { color: colors.green, fontWeight: '500' },
  hero: { backgroundColor: colors.greenDark, borderRadius: radius.large, minHeight: 230, padding: 23, justifyContent: 'center', overflow: 'hidden', gap: 10 },
  heroTitle: { color: '#FFFFFF', fontSize: 35, lineHeight: 38, letterSpacing: -1.3, fontWeight: '800', marginTop: 5 },
  heroSubtitle: { color: '#D1E3DC', fontSize: 13, lineHeight: 20, maxWidth: 300 },
  orbit: { position: 'absolute', right: -21, bottom: -27, width: 145, height: 145, borderRadius: 75, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  orbitIcon: { fontSize: 39, color: colors.gold },
  orbitDot: { position: 'absolute', top: 13, left: 20, width: 10, height: 10, borderRadius: 8, backgroundColor: colors.coral },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: radius.large, padding: 19, gap: 15, borderWidth: 1, borderColor: colors.line },
  switcher: { flexDirection: 'row', padding: 4, backgroundColor: colors.background, borderRadius: radius.pill },
  switchTab: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  switchTabActive: { backgroundColor: colors.greenDark },
  switchText: { color: colors.muted, fontSize: 13, fontWeight: '700' },
  switchTextActive: { color: '#FFFFFF' },
  formTitle: { color: colors.ink, fontSize: 20, fontWeight: '800' },
  error: { color: colors.danger, fontSize: 12, lineHeight: 18 },
  notice: { color: colors.greenDark, backgroundColor: colors.mint, padding: 11, borderRadius: 12, fontSize: 12, lineHeight: 18 },
  terms: { color: colors.muted, fontSize: 11, lineHeight: 16, textAlign: 'center' },
  resend: { color: colors.green, fontSize: 12, fontWeight: '700', alignSelf: 'flex-start' },
  backLink: { alignSelf: 'center', padding: 4 },
  backText: { color: colors.greenDark, fontSize: 13, fontWeight: '700' },
  footer: { color: '#8A9691', fontSize: 11, textAlign: 'center', letterSpacing: 0.7 },
})
