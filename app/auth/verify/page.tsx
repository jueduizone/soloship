import Link from 'next/link'
import { t } from '@/lib/i18n'

export default function VerifyPage() {
  return (
    <div className="ss-auth-card">
      <div className="ss-auth-title">{t.auth.verify.title}</div>
      <div className="ss-auth-sub">{t.auth.verify.body}</div>
      <div className="ss-auth-foot">
        <Link href="/auth/login">{t.auth.login.title}</Link>
      </div>
    </div>
  )
}
