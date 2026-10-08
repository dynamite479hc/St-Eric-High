// Loads shared school settings (contact info, social links, branding)
// and applies them to any page that has the matching data-site hooks.
// Must be loaded after supabase-client.js. If a setting is missing or
// the request fails, the hardcoded text already on the page stays put.
(async function applySiteSettings(){
  if (typeof sb === 'undefined') return;

  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = u => /^https?:\/\//i.test(u) ? u : '';

  const { data, error } = await sb.from('site_settings').select('*')
    .in('key', ['contact_info', 'social_links', 'branding']);
  if (error || !data) return;
  const s = {};
  data.forEach(r => s[r.key] = r.value);

  const contact = s.contact_info;
  if (contact) {
    const lines = [contact.address, contact.phone, contact.email].filter(Boolean);
    document.querySelectorAll('[data-site="contact"]').forEach(ul => {
      ul.innerHTML = lines.map(l => `<li>${esc(l)}</li>`).join('');
      const social = s.social_links || {};
      const names = { instagram:'Instagram', facebook:'Facebook', youtube:'YouTube', x:'X' };
      const links = Object.keys(names)
        .filter(k => safeUrl(social[k] || ''))
        .map(k => `<a href="${esc(safeUrl(social[k]))}" target="_blank" rel="noopener" style="text-decoration:underline">${names[k]}</a>`);
      if (links.length) ul.innerHTML += `<li>${links.join(' · ')}</li>`;
    });
    const map = { address: contact.address, phone: contact.phone, email: contact.email };
    Object.keys(map).forEach(k => {
      if (!map[k]) return;
      document.querySelectorAll(`[data-site="contact-${k}"]`).forEach(el => el.textContent = map[k]);
    });
  }

  const b = s.branding;
  if (b) {
    if (b.tagline) document.querySelectorAll('[data-site="tagline"]').forEach(el => el.textContent = b.tagline);
    if (b.school_name) document.querySelectorAll('[data-site="copyright"]')
      .forEach(el => el.textContent = `© ${new Date().getFullYear()} ${b.school_name}. All rights reserved.`);
    if (safeUrl(b.logo_url || '')) document.querySelectorAll('.crest img').forEach(img => img.src = b.logo_url);
  }
})();
