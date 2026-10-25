import { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput } from 'react-native'
import { router } from 'expo-router'
import { Button, Card, ErrorBanner, Page, PageHeading } from '../components/ui'
import { askAssistant } from '../lib/api'
import { colors, radius } from '../lib/theme'

export default function AssistantScreen() {
  const [message, setMessage] = useState('')
  const [answer, setAnswer] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (!message.trim()) return
    setBusy(true)
    setError('')
    try {
      const result = await askAssistant(message.trim())
      setAnswer(result.answer)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The assistant is unavailable.')
    } finally {
      setBusy(false)
    }
  }

  return <Page>
    <Pressable onPress={() => router.back()}><Text style={styles.back}>← Back</Text></Pressable>
    <PageHeading eyebrow="PLAN WITH CONFIDENCE" title="Erasmus assistant" subtitle="Ask for a shortlist, a budget sanity check, or questions to confirm with your coordinator." />
    <Card style={styles.notice}><Text style={styles.noticeTitle}>Use official sources for final decisions</Text><Text style={styles.noticeBody}>The assistant is a planning aid. It must not replace your university agreement, current deadline, or grant confirmation.</Text></Card>
    <Card style={styles.form}>
      <TextInput
        value={message}
        onChangeText={setMessage}
        multiline
        placeholder="Example: I study Computer Science, have €650/month, and want a safe city with strong student life. Which destinations should I compare?"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
      <Button label={busy ? 'Thinking…' : 'Ask assistant'} onPress={() => { void submit() }} disabled={busy || !message.trim()} />
    </Card>
    {error ? <ErrorBanner message={error} /> : null}
    {answer ? <Card style={styles.answer}><Text style={styles.answerLabel}>ASSISTANT</Text><Text style={styles.answerText}>{answer}</Text></Card> : null}
  </Page>
}

const styles = StyleSheet.create({
  back: { color: colors.green, fontWeight: '800', fontSize: 13, marginBottom: 2 },
  notice: { backgroundColor: '#F2EBDC', borderColor: '#EFE6D4', gap: 5 },
  noticeTitle: { color: colors.ink, fontWeight: '800', fontSize: 13 },
  noticeBody: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  form: { gap: 12 },
  input: { minHeight: 120, borderWidth: 1, borderColor: colors.line, borderRadius: radius.medium, padding: 13, color: colors.ink, fontSize: 13, lineHeight: 19, textAlignVertical: 'top' },
  answer: { gap: 8, backgroundColor: '#E3EEE7', borderColor: '#D7E5DB' },
  answerLabel: { color: colors.green, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  answerText: { color: colors.ink, fontSize: 13, lineHeight: 20 },
})
