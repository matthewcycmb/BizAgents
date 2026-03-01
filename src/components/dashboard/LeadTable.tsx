import type { Lead } from '../../types'

interface LeadTableProps {
  leads: Lead[]
  loading: boolean
  onStatusChange: (id: string, status: 'new' | 'contacted') => void
}

export function LeadTable({ leads, loading, onStatusChange }: LeadTableProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-200 rounded" />
        ))}
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500 text-lg">No leads yet</p>
        <p className="text-gray-400 text-sm mt-1">
          Share your chat link to start capturing leads!
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timeline</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{lead.name}</td>
              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{lead.email}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{lead.service_type || '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{lead.budget || '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{lead.timeline || '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{lead.notes || '-'}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <select
                  value={lead.status}
                  onChange={(e) => onStatusChange(lead.id, e.target.value as 'new' | 'contacted')}
                  className={`text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer ${
                    lead.status === 'new'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                </select>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                {new Date(lead.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
