import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Business } from '../types'

export function useBusiness() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBusinesses = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setBusinesses(data as Business[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchBusinesses()
  }, [fetchBusinesses])

  const createBusiness = async (name: string, url: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('businesses')
      .insert({ name, url, owner_id: user.id })
      .select()
      .single()

    if (error) throw error
    setBusinesses((prev) => [data as Business, ...prev])
    return data as Business
  }

  const refreshBusiness = async (id: string) => {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return
    setBusinesses((prev) =>
      prev.map((b) => (b.id === id ? (data as Business) : b))
    )
  }

  return { businesses, loading, error, createBusiness, refreshBusiness, fetchBusinesses }
}
