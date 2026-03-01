interface SiteStatusProps {
  status: 'pending' | 'scraping' | 'completed' | 'failed'
}

const statusConfig = {
  pending: { label: 'Pending', classes: 'bg-gray-100 text-gray-700' },
  scraping: { label: 'Scraping...', classes: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Completed', classes: 'bg-green-100 text-green-700' },
  failed: { label: 'Failed', classes: 'bg-red-100 text-red-700' },
}

export function SiteStatus({ status }: SiteStatusProps) {
  const config = statusConfig[status]

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes}`}>
      {status === 'scraping' && (
        <span className="animate-spin mr-1.5 h-3 w-3 border-2 border-yellow-700 border-t-transparent rounded-full" />
      )}
      {config.label}
    </span>
  )
}
