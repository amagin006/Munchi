import { createBrowserClient, createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";

export async function getServerClient(request: Request) {
  const headers = new Headers()
  const supabase = await createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get('Cookie') ?? '').filter(
            (cookie): cookie is { name: string; value: string } => typeof cookie.value === 'string'
          );
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            headers.append('Set-Cookie', serializeCookieHeader(name, value, options))
          )
        },
      },
    })

  return supabase
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