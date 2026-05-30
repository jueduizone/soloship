import type { RegistrationStatus } from '@/lib/db/types'

export const ADMIN_REGISTRATION_STATUS_LABEL: Record<RegistrationStatus, string> = {
  submitted: '待审核',
  reviewing: '审核中',
  admitted: '已录取',
  waitlisted: '候补',
  rejected: '未录取',
  payment_pending: '待付款确认',
  paid: '已入营',
  withdrawn: '已退出',
}

export const ADMIN_REGISTRATION_STATUS_FILTERS: Array<{
  key: string
  label: string
  values?: RegistrationStatus[]
}> = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待审核', values: ['submitted', 'reviewing'] },
  { key: 'admitted', label: '已录取', values: ['admitted'] },
  { key: 'payment_pending', label: '待付款确认', values: ['payment_pending'] },
  { key: 'paid', label: '已入营', values: ['paid'] },
  { key: 'waitlisted', label: '候补', values: ['waitlisted'] },
  { key: 'rejected', label: '未录取', values: ['rejected'] },
  { key: 'withdrawn', label: '已退出', values: ['withdrawn'] },
]
