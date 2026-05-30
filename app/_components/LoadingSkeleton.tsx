type SkeletonPageProps = {
  title?: string
  variant?: 'form' | 'grid' | 'detail' | 'admin' | 'home'
}

function SkeletonLine({ className = '' }: { className?: string }) {
  return <span className={`ss-skeleton-line ${className}`} aria-hidden="true" />
}

function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="ss-skeleton-card" aria-hidden="true">
      <SkeletonLine className="is-short" />
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLine key={index} className={index === lines - 1 ? 'is-mid' : ''} />
      ))}
    </div>
  )
}

export function PublicPageSkeleton({ title = '页面加载中', variant = 'form' }: SkeletonPageProps) {
  if (variant === 'home') {
    return (
      <div className="ss-skeleton-page ss-skeleton-home" role="status" aria-label={title}>
        <div className="ss-skeleton-hero-copy">
          <SkeletonLine className="is-eyebrow" />
          <SkeletonLine className="is-title" />
          <SkeletonLine className="is-title is-title-small" />
          <SkeletonLine className="is-sub" />
          <div className="ss-skeleton-actions">
            <SkeletonLine className="is-button" />
            <SkeletonLine className="is-button is-ghost" />
          </div>
        </div>
        <div className="ss-skeleton-hero-panel" aria-hidden="true">
          <SkeletonCard lines={5} />
        </div>
      </div>
    )
  }

  return (
    <div className="ss-skeleton-page" role="status" aria-label={title}>
      <div className="ss-skeleton-header">
        <SkeletonLine className="is-eyebrow" />
        <SkeletonLine className="is-heading" />
        <SkeletonLine className="is-sub" />
      </div>
      {variant === 'grid' ? (
        <div className="ss-skeleton-grid">
          {Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} lines={3} />)}
        </div>
      ) : variant === 'detail' ? (
        <div className="ss-skeleton-detail">
          <div className="ss-skeleton-avatar" aria-hidden="true" />
          <div>
            <SkeletonLine className="is-heading" />
            <SkeletonLine className="is-sub" />
          </div>
          <SkeletonCard lines={6} />
        </div>
      ) : (
        <div className="ss-skeleton-form">
          <SkeletonCard lines={5} />
          <SkeletonLine className="is-button" />
        </div>
      )}
      <span className="ss-sr-only">{title}</span>
    </div>
  )
}

export function AdminPageSkeleton({ title = '管理后台加载中', variant = 'admin' }: SkeletonPageProps) {
  return (
    <div className="ss-admin-container ss-admin-skeleton" role="status" aria-label={title}>
      <div className="ss-skeleton-header">
        <SkeletonLine className="is-heading" />
        <SkeletonLine className="is-sub" />
      </div>
      {variant === 'grid' ? (
        <div className="ss-skeleton-grid is-admin-grid">
          {Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} lines={2} />)}
        </div>
      ) : variant === 'detail' ? (
        <div className="ss-skeleton-detail is-admin-detail">
          <SkeletonCard lines={5} />
          <SkeletonCard lines={4} />
          <SkeletonCard lines={3} />
        </div>
      ) : (
        <>
          <div className="ss-admin-metrics">
            {Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} lines={1} />)}
          </div>
          <div className="ss-admin-quick-grid">
            {Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} lines={3} />)}
          </div>
        </>
      )}
      <span className="ss-sr-only">{title}</span>
    </div>
  )
}
