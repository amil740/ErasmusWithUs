import type {
  AuthResponse,
  ChatMessage,
  CommunityStudent,
  ConversationSummary,
  DeadlineReminder,
  ExperienceSummary,
  Opportunity,
  MatchProfile,
  MatchResult,
  ProfileUpdate,
  StudentPlan,
  OpportunityAnswer,
  OpportunityQuestion,
  User,
} from './types'
import { cacheOpportunities, readCachedOpportunities } from './offline-cache'

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || 'https://erasmuswithus-api.onrender.com').replace(/\/$/, '')

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, token?: string, init: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    })
  } catch {
    throw new Error(`Can't reach ErasmusWithUs. Check your connection and API address (${API_BASE_URL}).`)
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string; detail?: string } | null
    throw new ApiError(payload?.message ?? payload?.detail ?? `Request failed (${response.status}).`, response.status)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function getOpportunities(params: { search?: string; country?: string } = {}) {
  const query = new URLSearchParams()
  if (params.search?.trim()) query.set('search', params.search.trim())
  if (params.country) query.set('country', params.country)
  const queryString = query.toString()
  const suffix = queryString ? `?${queryString}` : ''
  const cacheKey = `opportunities:${query.toString()}`
  return request<Opportunity[]>(`/api/opportunities${suffix}`)
    .then(async (result) => {
      await cacheOpportunities(cacheKey, result).catch(() => undefined)
      return result
    })
    .catch(async (error) => {
      const cached = await readCachedOpportunities(cacheKey).catch(() => null)
      if (cached) return cached
      throw error
    })
}

export function registerPushDevice(token: string, expoPushToken: string, platform: string) {
  return request<{ registered: boolean }>('/api/notifications/devices', token, {
    method: 'POST',
    body: JSON.stringify({ expoPushToken, platform }),
  })
}

export function unregisterPushDevice(token: string, expoPushToken: string) {
  return request<void>(`/api/notifications/devices?expoPushToken=${encodeURIComponent(expoPushToken)}`, token, {
    method: 'DELETE',
  })
}

export function askAssistant(message: string) {
  return request<{ answer: string }>('/api/assistant/recommend', undefined, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })
}

export function getOpportunity(id: number) {
  return request<Opportunity>(`/api/opportunities/${id}`)
}

export function getCountries() {
  return request<string[]>('/api/catalog/countries')
}

export function getMatches(profile: MatchProfile) {
  return request<MatchResult[]>('/api/matching', undefined, { method: 'POST', body: JSON.stringify(profile) })
}

export function register(payload: { email: string; password: string; displayName: string }) {
  return request<AuthResponse>('/api/auth/register', undefined, { method: 'POST', body: JSON.stringify(payload) })
}

export function login(payload: { email: string; password: string }) {
  return request<AuthResponse>('/api/auth/login', undefined, { method: 'POST', body: JSON.stringify(payload) })
}

export function verifyEmail(payload: { email: string; token: string }) {
  return request<{ message: string }>('/api/auth/verify-email', undefined, { method: 'POST', body: JSON.stringify(payload) })
}

export function requestVerification(payload: { email: string }) {
  return request<{ message: string; token?: string }>('/api/auth/request-email-verification', undefined, { method: 'POST', body: JSON.stringify(payload) })
}

export function getMe(token: string) {
  return request<User>('/api/auth/me', token)
}

export function updateProfile(token: string, payload: ProfileUpdate) {
  return request<User>('/api/profile', token, { method: 'PUT', body: JSON.stringify(payload) })
}

export function getPlans(token: string) {
  return request<StudentPlan[]>('/api/community/plans', token)
}

export function createPlan(token: string, payload: { opportunityId: number; intake: string }) {
  return request<StudentPlan>('/api/community/plans', token, { method: 'POST', body: JSON.stringify(payload) })
}

export function deletePlan(token: string, id: number) {
  return request<void>(`/api/community/plans/${id}`, token, { method: 'DELETE' })
}

export function updatePlan(token: string, id: number, payload: { stage: string; completedTasks: string[] }) {
  return request<StudentPlan>(`/api/community/plans/${id}`, token, { method: 'PUT', body: JSON.stringify(payload) })
}

export function getStudents(token: string, opportunityId: number, intake: string, roommatesOnly = false) {
  const query = new URLSearchParams({ opportunityId: String(opportunityId), intake, roommatesOnly: String(roommatesOnly) })
  return request<CommunityStudent[]>(`/api/community/students?${query}`, token)
}

export function getConversations(token: string) {
  return request<ConversationSummary[]>('/api/community/conversations', token)
}

export function startConversation(token: string, payload: { recipientUserId: number; opportunityId: number; intake: string }) {
  return request<{ conversationId: number }>('/api/community/conversations', token, { method: 'POST', body: JSON.stringify(payload) })
}

export function getMessages(token: string, conversationId: number) {
  return request<ChatMessage[]>(`/api/community/conversations/${conversationId}/messages`, token)
}

export function sendMessage(token: string, conversationId: number, content: string) {
  return request<ChatMessage>(`/api/community/conversations/${conversationId}/messages`, token, {
    method: 'POST', body: JSON.stringify({ content }),
  })
}

export function getDeadlineReminders(token: string) {
  return request<DeadlineReminder[]>('/api/reminders', token)
}

export function saveDeadlineReminder(token: string, opportunityId: number, daysBefore = 7) {
  return request<DeadlineReminder>('/api/reminders', token, {
    method: 'POST', body: JSON.stringify({ opportunityId, daysBefore }),
  })
}

export function deleteDeadlineReminder(token: string, id: number) {
  return request<void>(`/api/reminders/${id}`, token, { method: 'DELETE' })
}

export function getExperiences(opportunityId: number) {
  return request<ExperienceSummary>(`/api/opportunities/${opportunityId}/experiences`)
}

export function saveExperience(token: string, opportunityId: number, payload: {
  rating: number; experienceType: 'Alumni' | 'Planning'; intake: string; content: string
}) {
  return request<ExperienceSummary['experiences'][number]>(`/api/opportunities/${opportunityId}/experiences`, token, {
    method: 'POST', body: JSON.stringify(payload),
  })
}

export function getOpportunityQuestions(opportunityId: number) {
  return request<OpportunityQuestion[]>(`/api/opportunities/${opportunityId}/questions`)
}

export function askOpportunityQuestion(token: string, opportunityId: number, content: string) {
  return request<OpportunityQuestion>(`/api/opportunities/${opportunityId}/questions`, token, {
    method: 'POST', body: JSON.stringify({ content }),
  })
}

export function answerOpportunityQuestion(token: string, questionId: number, payload: { content: string; experienceType: 'Alumni' | 'Planning' }) {
  return request<OpportunityAnswer>(`/api/questions/${questionId}/answers`, token, {
    method: 'POST', body: JSON.stringify(payload),
  })
}

export function submitCatalogCorrection(token: string, opportunityId: number, payload: {
  fields: Record<string, string>; sourceUrl?: string; note: string
}) {
  return request<{ id: number; status: string; createdAt: string }>(`/api/opportunities/${opportunityId}/corrections`, token, {
    method: 'POST', body: JSON.stringify(payload),
  })
}

export function getCommunityBlocks(token: string) {
  return request<number[]>('/api/community/blocks', token)
}

export function blockCommunityUser(token: string, userId: number) {
  return request<void>(`/api/community/users/${userId}/block`, token, { method: 'POST' })
}

export function unblockCommunityUser(token: string, userId: number) {
  return request<void>(`/api/community/users/${userId}/block`, token, { method: 'DELETE' })
}

export function reportCommunityUser(token: string, payload: { reportedUserId: number; conversationId: number; reason: string }) {
  return request<void>('/api/community/reports', token, { method: 'POST', body: JSON.stringify(payload) })
}
