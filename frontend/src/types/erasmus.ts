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
  eligibility?: EligibilityAssessment
}

export type EligibilityAssessment = {
  meetsPublishedRequirements: boolean
  hasEnoughProfileData: boolean
  agreementVerified: boolean
  reasons: string[]
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
  homeUniversity?: string | null
  intake?: string | null
  bio?: string | null
  communityVisible?: boolean
  profilePhotoDataUrl?: string | null
  roommateSearch?: boolean
}

export type StudentPlan = {
  id: number
  opportunityId: number
  university: string
  intake: string
  createdAt: string
  stage: string
  completedTasks: string[]
  updatedAt: string
}

export type CommunityStudent = {
  id: number
  displayName: string
  homeUniversity: string | null
  studyField: string | null
  level: string | null
  intake: string | null
  bio: string | null
  profilePhotoDataUrl: string | null
  roommateSearch: boolean
}

export type OpportunityAnswer = {
  id: number
  displayName: string
  experienceType: 'Alumni' | 'Planning'
  content: string
  createdAt: string
}

export type OpportunityQuestion = {
  id: number
  displayName: string
  content: string
  createdAt: string
  answers: OpportunityAnswer[]
}

export type CatalogCorrection = {
  id: number
  opportunityId: number
  university: string
  displayName: string
  fields: Record<string, string | null>
  sourceUrl: string | null
  note: string
  status: string
  reviewerNote: string | null
  createdAt: string
  reviewedAt: string | null
}

export type ConversationSummary = {
  id: number
  otherUserId: number
  otherDisplayName: string
  otherHomeUniversity: string | null
  otherProfilePhotoDataUrl: string | null
  university: string
  intake: string
  lastMessage: string | null
  lastMessageAt: string | null
  createdAt: string
  unreadCount?: number
  isBlocked?: boolean
}

export type DeadlineReminder = {
  id: number
  opportunityId: number
  university: string
  deadline: string
  daysBefore: number
  createdAt: string
  sentAt: string | null
}

export type StudentExperience = {
  id: number
  displayName: string
  rating: number
  experienceType: 'Alumni' | 'Planning'
  intake: string
  content: string
  createdAt: string
}

export type ExperienceSummary = {
  averageRating: number
  count: number
  experiences: StudentExperience[]
}

export type ChatMessage = {
  id: number
  senderUserId: number
  content: string
  createdAt: string
}

export type AuthResponse = {
  token: string
  user: User
  message?: string
  verificationRequired?: boolean
  verificationCode?: string | null
}
