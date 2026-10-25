import { useCallback, useRef, useState } from 'react'
import { ActivityIndicator, AppState, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type ScrollViewInstance } from 'react-native'
import { Redirect, router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { Avatar, Button, ErrorBanner, Field } from '../../components/ui'
import { blockCommunityUser, getCommunityBlocks, getConversations, getMessages, reportCommunityUser, sendMessage, unblockCommunityUser } from '../../lib/api'
import { formatTime } from '../../lib/format'
import { colors, radius } from '../../lib/theme'
import type { ChatMessage, ConversationSummary } from '../../lib/types'
import { useAuth } from '../../providers/auth-provider'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ConversationScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>()
  const id = Number(rawId)
  const { token, user } = useAuth()
  const sessionToken = token ?? ''
  const [conversation, setConversation] = useState<ConversationSummary | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [blockedUserIds, setBlockedUserIds] = useState<number[]>([])
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [notice, setNotice] = useState('')
  const scroll = useRef<ScrollViewInstance>(null)

  useFocusEffect(useCallback(() => {
    if (!sessionToken || !id) return
    let active = true
    const refresh = async () => {
      try {
        const [allConversations, nextMessages, nextBlockedUserIds] = await Promise.all([getConversations(sessionToken), getMessages(sessionToken, id), getCommunityBlocks(sessionToken)])
        if (!active) return
        const selected = allConversations.find((item) => item.id === id) ?? null
        setConversation(selected)
        setMessages(nextMessages)
        setBlockedUserIds(nextBlockedUserIds)
        setError('')
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Could not load this conversation.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void refresh()
    const timer = setInterval(() => {
      if (AppState.currentState === 'active') void refresh()
    }, 6000)
    return () => { active = false; clearInterval(timer) }
  }, [sessionToken, id]))

  if (!sessionToken) return <Redirect href="/auth" />

  async function submit() {
    const trimmed = content.trim()
    if (!trimmed || sending || !sessionToken || conversation?.isBlocked) return
    setSending(true)
    setError('')
    try {
      const sent = await sendMessage(sessionToken, id, trimmed)
      setMessages((current) => current.some((item) => item.id === sent.id) ? current : [...current, sent])
      setContent('')
      requestAnimationFrame(() => scroll.current?.scrollToEnd({ animated: true }))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Message could not be sent.')
    } finally {
      setSending(false)
    }
  }

  async function toggleBlock() {
    if (!conversation) return
    const blockedId = conversation.otherUserId
    setError(''); setNotice('')
    try {
      if (blockedUserIds.includes(blockedId)) {
        await unblockCommunityUser(sessionToken, blockedId)
        setBlockedUserIds((current) => current.filter((userId) => userId !== blockedId))
        setNotice('Student unblocked. They may find and message you again.')
      } else {
        await blockCommunityUser(sessionToken, blockedId)
        setBlockedUserIds((current) => current.includes(blockedId) ? current : [...current, blockedId])
        setNotice('Student blocked. Messages are disabled.')
      }
      const [nextBlocks, nextConversations] = await Promise.all([getCommunityBlocks(sessionToken), getConversations(sessionToken)])
      setBlockedUserIds(nextBlocks)
      setConversation(nextConversations.find((item) => item.id === id) ?? null)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update this block.')
    }
  }

  async function submitReport() {
    if (!conversation || !reportReason.trim()) return
    setError(''); setNotice('')
    try {
      await reportCommunityUser(sessionToken, { reportedUserId: conversation.otherUserId, conversationId: conversation.id, reason: reportReason.trim() })
      setReportReason(''); setShowReport(false); setNotice('Report submitted for review.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not submit this report.')
    }
  }

  return <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
        <Avatar uri={conversation?.otherProfilePhotoDataUrl} name={conversation?.otherDisplayName ?? 'Student'} size={41} />
        <View style={styles.headerCopy}><Text style={styles.personName} numberOfLines={1}>{conversation?.otherDisplayName ?? 'Exchange student'}</Text><Text style={styles.destination} numberOfLines={1}>{conversation ? `${conversation.university} · ${conversation.intake}` : 'Your exchange circle'}</Text></View>
        <View style={styles.headerActions}><Pressable accessibilityRole="button" accessibilityLabel="Report student" onPress={() => setShowReport((current) => !current)} style={styles.headerAction}><Text style={styles.headerActionText}>⚑</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={blockedUserIds.includes(conversation?.otherUserId ?? -1) ? 'Unblock student' : 'Block student'} disabled={Boolean(conversation?.isBlocked && !blockedUserIds.includes(conversation.otherUserId))} onPress={() => { void toggleBlock() }} style={[styles.headerAction, conversation?.isBlocked && styles.actionDisabled]}><Text style={styles.headerActionText}>⊘</Text></Pressable></View>
      </View>
      {error ? <View style={styles.errorWrap}><ErrorBanner message={error} /></View> : null}
      {notice ? <Pressable onPress={() => setNotice('')} style={styles.notice}><Text style={styles.noticeText}>{notice}</Text></Pressable> : null}
      {conversation?.isBlocked ? <Text style={styles.blockedNotice}>{blockedUserIds.includes(conversation.otherUserId) ? 'You blocked this student. Messages are disabled.' : 'This student has blocked the conversation.'}</Text> : null}
      {showReport ? <View style={styles.reportForm}><Field label="WHY ARE YOU REPORTING THIS STUDENT?" value={reportReason} onChangeText={setReportReason} multiline maxLength={500} /><Text style={styles.characterCount}>{reportReason.length}/500</Text><Button label="Submit report" onPress={() => { void submitReport() }} disabled={!reportReason.trim()} compact /></View> : null}
      <ScrollView ref={scroll} style={styles.messages} contentContainerStyle={styles.messagesContent} keyboardShouldPersistTaps="handled" onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}>
        <View style={styles.dateDivider}><View style={styles.dateRule} /><Text style={styles.dateText}>{conversation ? `${conversation.university} · ${conversation.intake}` : 'Your exchange conversation'}</Text><View style={styles.dateRule} /></View>
        {loading ? <ActivityIndicator color={colors.green} style={{ marginTop: 26 }} /> : messages.map((message, index) => {
          const mine = message.senderUserId === user?.id
          const previous = messages[index - 1]
          const sameSender = previous?.senderUserId === message.senderUserId
          return <View key={message.id} style={[styles.messageRow, mine ? styles.mineRow : styles.theirRow, sameSender && styles.tightRow]}>
            {!mine && !sameSender ? <Avatar uri={conversation?.otherProfilePhotoDataUrl} name={conversation?.otherDisplayName ?? 'Student'} size={26} /> : !mine ? <View style={{ width: 26 }} /> : null}
            <View style={[styles.bubble, mine ? styles.mineBubble : styles.theirBubble]}><Text style={[styles.messageText, mine && styles.mineText]}>{message.content}</Text><Text style={[styles.messageTime, mine && styles.mineTime]}>{formatTime(message.createdAt)}</Text></View>
          </View>
        })}
        {!loading && messages.length === 0 ? <View style={styles.firstMessage}><Text style={styles.firstIcon}>✦</Text><Text style={styles.firstTitle}>Say hello to {conversation?.otherDisplayName ?? 'your exchange buddy'}.</Text><Text style={styles.firstBody}>You are both planning the same destination for the same term. Start with what you are most excited about.</Text></View> : null}
      </ScrollView>
      <View style={styles.composer}><TextInput value={content} onChangeText={setContent} placeholder={conversation?.isBlocked ? 'Messaging is disabled' : 'Write a message...'} placeholderTextColor="#8A9894" multiline maxLength={2000} editable={!conversation?.isBlocked} style={styles.input} onSubmitEditing={submit} blurOnSubmit={false} returnKeyType="send" /><Pressable accessibilityRole="button" accessibilityLabel="Send message" disabled={!content.trim() || sending || Boolean(conversation?.isBlocked)} onPress={submit} style={[styles.sendButton, (!content.trim() || sending || conversation?.isBlocked) && styles.sendDisabled]}><Text style={styles.sendText}>{sending ? '·' : '↑'}</Text></Pressable></View>
      <Text style={styles.hint}>Be kind. Keep personal details safe.</Text>
    </KeyboardAvoidingView>
  </SafeAreaView>
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', backgroundColor: '#FFFFFF' },
  header: { height: 66, borderBottomWidth: 1, borderBottomColor: colors.line, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 },
  back: { width: 28, height: 42, justifyContent: 'center' },
  backText: { fontSize: 35, color: colors.greenDark, lineHeight: 40, fontWeight: '400' },
  headerCopy: { flex: 1, gap: 3 },
  headerActions: { flexDirection: 'row', gap: 6 },
  headerAction: { width: 34, height: 34, borderRadius: 11, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  headerActionText: { color: colors.greenDark, fontSize: 18, fontWeight: '800' },
  actionDisabled: { opacity: 0.4 },
  reportForm: { paddingHorizontal: 14, paddingVertical: 10, gap: 6, borderBottomWidth: 1, borderBottomColor: colors.line },
  characterCount: { color: colors.muted, fontSize: 9, textAlign: 'right' },
  notice: { padding: 9, backgroundColor: '#EAF5ED' },
  noticeText: { color: colors.greenDark, fontSize: 10, textAlign: 'center' },
  blockedNotice: { color: '#9A661E', backgroundColor: '#FFF3D8', padding: 9, fontSize: 10, textAlign: 'center' },
  personName: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  destination: { color: colors.muted, fontSize: 10 },
  errorWrap: { paddingHorizontal: 14, paddingTop: 8 },
  messages: { flex: 1, backgroundColor: colors.background },
  messagesContent: { paddingHorizontal: 14, paddingVertical: 16, gap: 8, flexGrow: 1, justifyContent: 'flex-end' },
  dateDivider: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 16, marginTop: 3 },
  dateRule: { flex: 1, height: 1, backgroundColor: colors.line },
  dateText: { color: colors.muted, fontSize: 9, fontWeight: '700', maxWidth: '70%', textAlign: 'center' },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  mineRow: { justifyContent: 'flex-end' },
  theirRow: { justifyContent: 'flex-start' },
  tightRow: { marginTop: -5 },
  bubble: { maxWidth: '78%', borderRadius: 17, paddingHorizontal: 12, paddingTop: 9, paddingBottom: 6, gap: 5 },
  mineBubble: { borderBottomRightRadius: 5, backgroundColor: colors.greenDark },
  theirBubble: { borderBottomLeftRadius: 5, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.line },
  messageText: { color: colors.ink, fontSize: 13, lineHeight: 19 },
  mineText: { color: '#FFFFFF' },
  messageTime: { color: '#84918C', fontSize: 8, alignSelf: 'flex-end' },
  mineTime: { color: '#B4D0C5' },
  firstMessage: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 28, gap: 9 },
  firstIcon: { color: colors.coral, fontSize: 29 },
  firstTitle: { color: colors.ink, fontSize: 16, textAlign: 'center', fontWeight: '800' },
  firstBody: { color: colors.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  composer: { marginHorizontal: 12, marginTop: 8, borderWidth: 1, borderColor: colors.line, borderRadius: radius.large, backgroundColor: colors.background, flexDirection: 'row', alignItems: 'flex-end', padding: 6, gap: 7 },
  input: { flex: 1, maxHeight: 110, minHeight: 39, color: colors.ink, paddingHorizontal: 10, paddingVertical: 9, fontSize: 13 },
  sendButton: { width: 39, height: 39, borderRadius: 21, backgroundColor: colors.greenDark, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { opacity: 0.38 },
  sendText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', lineHeight: 25, marginTop: -2 },
  hint: { color: '#8A9691', textAlign: 'center', fontSize: 9, paddingVertical: 8 },
})
