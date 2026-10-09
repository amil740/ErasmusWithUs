import type { AuthResponse, ErasmusOpportunity, MatchResult, StudentProfile, User } from '../types/erasmus'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5238'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string } | null
    throw new Error(payload?.message ?? `API request failed with status ${response.status}`)
  }
  return response.json() as Promise<T>
}

export function getOpportunities(params: { search?: string; country?: string; level?: string }) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => value && query.set(key, value))
  return request<ErasmusOpportunity[]>(`/api/opportunities?${query.toString()}`)
}

export function getMatches(profile: StudentProfile) {
  return request<MatchResult[]>('/api/matching', {
    method: 'POST',
    body: JSON.stringify(profile),
  })
}

export function registerAccount(payload: { email: string; password: string; displayName: string }) {
  return request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) })
}

export function loginAccount(payload: { email: string; password: string }) {
  return request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) })
}

export function getCurrentUser(token: string) {
  return request<User>('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
}

export function requestPasswordReset(payload: { email: string }) {
  return request<{ message: string; token?: string }>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function requestEmailVerification(payload: { email: string }) {
  return request<{ message: string; token?: string }>('/api/auth/request-email-verification', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function verifyEmail(payload: { email: string; token: string }) {
  return request<{ message: string }>('/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function resetPassword(payload: { email: string; token: string; newPassword: string }) {
  return request<{ message: string }>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateAccountSettings(token: string, payload: Partial<User> & {
  country?: string | null
  studyField?: string | null
  level?: string | null
  gpa?: number | null
  preferredCountries?: string[]
  languages?: string[]
}) {
  return request<User>('/api/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
}
