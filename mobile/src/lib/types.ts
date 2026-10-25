export type Opportunity = {
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
  verificationStatus: 'Verified' | 'NeedsReview'
  monthlyRentEstimate: number
  monthlyLivingEstimate: number
  studentBudgetEstimate: number
  grantCoveragePercent: number
  applicationDocuments: string[]
  studentExperience: string
  accommodationLinks: { name: string; url: string; note: string }[]
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
  emailVerified: boolean
  createdAt: string
  homeUniversity: string | null
  intake: string | null
  bio: string | null
  communityVisible: boolean
  profilePhotoDataUrl: string | null
  roommateSearch: boolean
}

export type AuthResponse = {
  token: string
  user: User
  verificationRequired: boolean
  verificationCode?: string | null
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

export type EligibilityAssessment = {
  meetsPublishedRequirements: boolean
  hasEnoughProfileData: boolean
  agreementVerified: boolean
  reasons: string[]
}

export type ChatMessage = {
  id: number
  senderUserId: number
  content: string
  createdAt: string
}

export type ProfileUpdate = {
  displayName: string
  country: string | null
  studyField: string | null
  level: string | null
  gpa: number | null
  preferredCountries: string[]
  languages: string[]
  homeUniversity: string | null
  intake: string | null
  bio: string | null
  communityVisible: boolean
  roommateSearch: boolean
  profilePhotoDataUrl?: string | null
  removeProfilePhoto?: boolean
}

export type MatchProfile = {
  homeUniversity: string | null
  intake: string | null
  country: string | null
  studyField: string | null
  level: string | null
  gpa: number
  preferredCountries: string[]
  languages: string[]
  likes: string[]
  dislikes: string[]
  budget: number | null
}

export type MatchResult = {
  opportunity: Opportunity
  score: number
  reasons: string[]
  breakdown: { name: string; points: number; maxPoints: number }[]
  eligibility?: EligibilityAssessment
}
