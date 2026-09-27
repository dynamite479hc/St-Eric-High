// ============================================================
// Fill these in once you've created your Supabase project:
// Supabase Dashboard → Project Settings → API
// ============================================================
const SUPABASE_URL = "https://rdtnpwfhdcbtkilzttrv.supabase.co"; // e.g. https://xxxxx.supabase.co
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkdG5wd2ZoZGNidGtpbHp0dHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1MTE3NDksImV4cCI6MjEwNjA4Nzc0OX0.iEkDWT5SxZWCATfiOM4FZnjUUMazKPdCrtK_czw_LDA";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Redirects to the login page if there's no active session.
// Call this at the top of every admin-*.html page (except admin-login.html).
async function requireAdminAuth(){
  const { data: { session } } = await sb.auth.getSession();
  if(!session){
    window.location.href = 'admin-login.html';
    return null;
  }
  return session;
}

async function adminSignOut(){
  await sb.auth.signOut();
  window.location.href = 'admin-login.html';
}
