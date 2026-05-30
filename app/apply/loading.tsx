import { PublicPageSkeleton } from '../_components/LoadingSkeleton'
import { getDictionary } from '@/lib/i18n'
import { getCurrentLocale } from '@/lib/i18n/site'
import { cookies } from 'next/headers'

export default function Loading() {
  return <PublicPageSkeleton title={getDictionary(getCurrentLocale(cookies())).common.applyLoading} variant="form" />
}
