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
