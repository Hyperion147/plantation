import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { CookieOptions } from '@supabase/ssr'

export async function getSupabaseServerClient() {
	const cookieStore = await cookies()
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

	const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			get(name: string) {
				return cookieStore.get(name)?.value
			},
			set(name: string, value: string, options: CookieOptions) {
				cookieStore.set({ name, value, ...options })
			},
			remove(name: string, options: CookieOptions) {
				cookieStore.set({ name, value: '', ...options })
			},
		},
	})

	return supabase
}