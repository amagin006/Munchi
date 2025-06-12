import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  console.log("import.meta.env.SUPABASE_URL", import.meta.env.VITE_SUPABASE_URL)
  return createBrowserClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
  )
}

// client side supabase client 
export async function getBrowserClient(url: string, key: string) {
  return createBrowserClient(url, key);
}

// sign in with email, password
export async function signIn({ url, key, email, password }: { url: string, key: string, email: string, password: string }) {
  const supabase = await getBrowserClient(url, key);
  return supabase.auth.signInWithPassword({ email, password });
}

// sign out
export async function signOut(url: string, key: string) {
  const supabase = await getBrowserClient(url, key);
  const { error } = await supabase.auth.signOut();
  return error
} 