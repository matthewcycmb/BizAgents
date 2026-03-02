interface SiteStatusProps {
  status: 'pending' | 'scraping' | 'completed' | 'failed'
}

const statusConfig = {
  pending: { label: 'Pending', classes: 'bg-bp-bg-card text-bp-text-secondary' },
  scraping: { label: 'Scraping...', classes: 'bg-bp-accent-green/20 text-bp-accent-green-light' },
  completed: { label: 'Completed', classes: 'bg-bp-accent-green/20 text-bp-accent-green-light' },
  failed: { label: 'Failed', classes: 'bg-bp-accent/20 text-bp-accent-light' },
}

export function SiteStatus({ status }: SiteStatusProps) {
  const config = statusConfig[status]

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes}`}>
      {status === 'scraping' && (
        <span className="animate-spin mr-1.5 h-3 w-3 border-2 border-bp-accent-green-light border-t-transparent rounded-full" />
      )}
      {config.label}
    </span>
  )
}
