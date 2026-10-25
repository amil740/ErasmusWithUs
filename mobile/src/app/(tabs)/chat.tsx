import { useCallback, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { Avatar, Card, EmptyState, ErrorBanner, Loading, Page, PageHeading, Pill } from '../../components/ui'
import { getConversations } from '../../lib/api'
import { formatDate } from '../../lib/format'
import { colors } from '../../lib/theme'
import type { ConversationSummary } from '../../lib/types'
import { useAuth } from '../../providers/auth-provider'

export default function ChatScreen() {
  const { token } = useAuth()
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!token) return
    setError('')
    try { setConversations(await getConversations(token)) }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not load your conversations.') }
    finally { setLoading(false) }
  }, [token])
  useFocusEffect(useCallback(() => { setLoading(true); void load() }, [load]))

  if (!token) return null
  return <Page>
    <PageHeading eyebrow="People on the same journey" title="Your chats" subtitle="Start a conversation with someone going to your destination." />
    <View style={styles.notice}><Text style={styles.noticeIcon}>✦</Text><Text style={styles.noticeText}>Chats connect students who share a destination and exchange term.</Text></View>
    {error ? <ErrorBanner message={error} onRetry={() => { setLoading(true); void load() }} /> : null}
    {loading ? <Loading label="Loading your conversations..." /> : conversations.map((conversation) => <Pressable key={conversation.id} onPress={() => router.push(`/conversation/${conversation.id}`)}><Card style={styles.chatCard}>
      <Avatar uri={conversation.otherProfilePhotoDataUrl} name={conversation.otherDisplayName} size={50} />
      <View style={styles.chatCopy}><View style={styles.chatTitleRow}><Text style={styles.name} numberOfLines={1}>{conversation.otherDisplayName}</Text>{(conversation.unreadCount ?? 0) > 0 ? <Pill tone="gold">{conversation.unreadCount ?? 0} NEW</Pill> : <Text style={styles.time}>{formatDate(conversation.lastMessageAt ?? conversation.createdAt)}</Text>}</View><Text style={styles.destination} numberOfLines={1}>{conversation.university} · {conversation.intake}</Text><Text style={styles.preview} numberOfLines={1}>{conversation.lastMessage || 'Start the conversation — say hello!'}</Text></View>
      <Text style={styles.chevron}>›</Text>
    </Card></Pressable>)}
    {!loading && !error && conversations.length === 0 ? <Card><EmptyState icon="◌" title="Your first chat starts with a plan" detail="Add a destination, find students heading there in the same term, then say hello." action={<Pill tone="gold">DESTINATION + TERM = YOUR PEOPLE</Pill>} /></Card> : null}
    {!loading && conversations.length === 0 ? <Pressable onPress={() => router.push('/(tabs)/plans')}><Text style={styles.link}>Go to my plans →</Text></Pressable> : null}
  </Page>
}

const styles = StyleSheet.create({
  notice: { flexDirection: 'row', alignItems: 'center', padding: 13, borderRadius: 14, backgroundColor: '#F2EBDC', gap: 10 },
  noticeIcon: { color: '#AD8847', fontSize: 18 },
  noticeText: { color: '#665D4A', fontSize: 11, lineHeight: 16, flex: 1 },
  chatCard: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 14 },
  chatCopy: { flex: 1, gap: 4 },
  chatTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 7 },
  name: { color: colors.ink, fontSize: 14, fontWeight: '800', flex: 1 },
  time: { color: colors.muted, fontSize: 9 },
  destination: { color: colors.green, fontSize: 10, fontWeight: '700' },
  preview: { color: colors.muted, fontSize: 11 },
  chevron: { fontSize: 26, color: '#9AA59F' },
  link: { color: colors.green, fontSize: 12, fontWeight: '800', textAlign: 'center', padding: 8 },
})
