import { createClient } from "./supabaseServer";

/**
 * Get the current authenticated user from server-side session
 * Returns the user object if authenticated, null otherwise
 * This should only be used in Server Components
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
