import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export function createServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
}

/**
 * Extracts Bearer token from request and verifies the user via Supabase auth.
 * Returns { user } on success or { error } on failure.
 */
export async function authenticateRequest(
  req: Request,
  serviceClient: SupabaseClient
): Promise<{ user: { id: string } | null; error: string | null }> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: 'Missing or invalid Authorization header' }
  }

  const token = authHeader.replace('Bearer ', '')
  const { data, error } = await serviceClient.auth.getUser(token)

  if (error || !data.user) {
    return { user: null, error: 'Invalid or expired token' }
  }

  return { user: { id: data.user.id }, error: null }
}
