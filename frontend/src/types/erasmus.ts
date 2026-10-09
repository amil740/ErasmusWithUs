export type VerificationStatus = 'Verified' | 'NeedsReview'

export type ErasmusOpportunity = {
  id: number
  university: string
  city: string
  country: string
  studyFields: string[]
  levels: string[]
  languages: string[]
  minimumGpa: number
  deadline: string
  monthlyGrant: number
  sourceUrl: string
  lastVerifiedAt: string
  verificationStatus: VerificationStatus
  monthlyRentEstimate: number
  monthlyLivingEstimate: number
  studentBudgetEstimate: number
  grantCoveragePercent: number
  applicationDocuments: string[]
  studentExperience: string
  accommodationLinks: AccommodationLink[]
}

export type AccommodationLink = {
  name: string
  url: string
  note: string
}

export type StudentProfile = {
  homeUniversity: string
  intake: string
  country: string
  studyField: string
  level: string
  gpa: number
  preferredCountries: string[]
  languages: string[]
  likes?: string[]
  dislikes?: string[]
  budget?: number
}

export type MatchResult = {
  opportunity: ErasmusOpportunity
  score: number
  reasons: string[]
  breakdown: MatchFactor[]
}

export type MatchFactor = {
  name: string
  points: number
  maxPoints: number
}

export type User = {
  id: number
  email: string
  displayName: string
  country: string | null
  studyField: string | null
  level: string | null
  gpa: number | null
  preferredCountries: string[]
  languages: string[]
  emailVerified?: boolean
  createdAt?: string
}

export type AuthResponse = {
  token: string
  user: User
  message?: string
  verificationRequired?: boolean
  verificationCode?: string | null
}
