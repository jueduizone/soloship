// Hand-written TS types mirroring lib/db/schema.sql.
// When the schema changes, update here too. (We can later generate via
// `supabase gen types typescript` — not wired up yet to keep deps minimal.)

export type RegistrationStatus =
  | 'submitted'
  | 'reviewing'
  | 'admitted'
  | 'waitlisted'
  | 'rejected'
  | 'payment_pending'
  | 'paid'
  | 'withdrawn'

export type AdmissionDecisionKind = 'admit' | 'waitlist' | 'reject'

export type PaymentConfirmationStatus = 'pending' | 'confirmed' | 'refunded'

export type EventStatus = 'draft' | 'recruiting' | 'reviewing' | 'running' | 'finished'

export type ProfileVisibility = 'public' | 'cohort_only' | 'private'

export type ResourceStage = 'pre_camp' | 'week_1' | 'week_2' | 'demo_day' | 'post_camp'

export type ResourceVisibility = 'public' | 'admitted_only'

export type BenefitType = 'token_code' | 'merch' | 'link' | 'manual'

export type BenefitStatus = 'active' | 'paused' | 'archived'

export type BenefitClaimStatus = 'claimed' | 'pending_fulfillment' | 'fulfilled' | 'cancelled'

export type LinkEntry = { label: string; url: string }

export interface EventRow {
  id: string
  slug: string
  name: string
  subtitle: string | null
  hero_text: string | null
  start_date: string | null
  end_date: string | null
  demo_day_date: string | null
  price_cents: number
  currency: string
  capacity: number | null
  status: EventStatus
  faq: unknown
  created_at: string
  updated_at: string
}

export interface RegistrationRow {
  id: string
  event_id: string
  user_id: string | null
  name: string
  email: string
  city: string | null
  contact: string | null
  bio: string | null
  build_direction: string | null
  project_idea: string | null
  links: LinkEntry[]
  extra: Record<string, unknown>
  status: RegistrationStatus
  reviewer_note: string | null
  tags: string[]
  submitted_at: string
  created_at: string
  updated_at: string
}

export interface AdmissionDecisionRow {
  id: string
  registration_id: string
  reviewer_id: string | null
  decision: AdmissionDecisionKind
  note: string | null
  decided_at: string
}

export interface PaymentConfirmationRow {
  id: string
  registration_id: string
  amount_cents: number
  currency: string
  channel: string | null
  external_ref: string | null
  screenshot_url: string | null
  status: PaymentConfirmationStatus
  confirmed_by: string | null
  confirmed_at: string | null
  note: string | null
  created_at: string
  updated_at: string
}

export interface FellowProfileRow {
  id: string
  registration_id: string
  event_id: string
  display_name: string
  avatar_url: string | null
  one_liner: string | null
  city: string | null
  tags: string[]
  project_name: string | null
  project_intro: string | null
  links: LinkEntry[]
  visibility: ProfileVisibility
  published: boolean
  created_at: string
  updated_at: string
}

export interface ResourceRow {
  id: string
  event_id: string
  title: string
  summary: string | null
  url: string | null
  type: string | null
  stage: ResourceStage
  visibility: ResourceVisibility
  order_index: number
  created_at: string
  updated_at: string
}

export interface BenefitRow {
  id: string
  event_id: string
  title: string
  provider: string | null
  type: BenefitType
  status: BenefitStatus
  description: string | null
  claim_instructions: string | null
  redeem_url: string | null
  total_stock: number | null
  per_user_limit: number
  starts_at: string | null
  ends_at: string | null
  order_index: number
  created_at: string
  updated_at: string
}

export interface BenefitCodeRow {
  id: string
  benefit_id: string
  code: string
  assigned_to_user_id: string | null
  assigned_claim_id: string | null
  assigned_at: string | null
  created_at: string
}

export interface BenefitClaimRow {
  id: string
  benefit_id: string
  user_id: string
  registration_id: string
  user_email: string
  user_name: string | null
  status: BenefitClaimStatus
  claim_payload: Record<string, unknown>
  fulfilled_at: string | null
  tracking_info: string | null
  created_at: string
  updated_at: string
}

export interface LotteryDrawRow {
  id: string
  event_id: string
  title: string
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface LotteryParticipantRow {
  id: string
  draw_id: string
  email: string
  created_at: string
}

export interface LotteryPrizeRow {
  id: string
  draw_id: string
  name: string
  winner_count: number
  order_index: number
  created_at: string
  updated_at: string
}

export interface LotteryWinnerRow {
  id: string
  draw_id: string
  prize_id: string
  email: string
  position: number
  drawn_by: string | null
  drawn_at: string
}
