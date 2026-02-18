const API_URL = 'https://localhost:5000/predict';

// Keep track of elements we've already processed so we don't double-blur
const processed = new WeakSet();

// ── Collect text elements worth checking ──────────────────────────────────────
// We target paragraph-level elements with meaningful text.
// We skip elements that contain other block elements to avoid double-processing
// (e.g. a <div> that wraps many <p> tags would otherwise be processed twice).
function getTextElements() {
  const candidates = document.querySelectorAll('p, li, td, blockquote, h1, h2, h3');
  return Array.from(candidates).filter(el => {
    const text = el.innerText?.trim();
    return (
      text &&
      text.length > 5 &&        // ignore very short snippets like nav links
      !processed.has(el)         // ignore already-processed elements
    );
  });
}

// ── Blur a toxic element and allow click-to-reveal ────────────────────────────
function blurElement(el) {
  el.style.filter = 'blur(5px)';
  el.style.transition = 'filter 0.3s ease';
  el.style.cursor = 'pointer';
  el.title = 'Toxic content hidden. Click to reveal.';

  el.addEventListener('click', () => {
    el.style.filter = 'none';
    el.title = '';
    el.style.cursor = 'default';
  }, { once: true });
}

// ── Main function: scan page and filter toxic content ─────────────────────────
async function filterPage() {
  const elements = getTextElements();
  if (elements.length === 0) return;


  const texts = elements.map(el => el.innerText.trim());

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      
      body: JSON.stringify({ texts })
    });

    if (!response.ok) {
      console.warn('[ToxicFilter] API returned an error:', response.status);
      return;
    }

    const results = await response.json();

    results.forEach((result, i) => {
      elements[i].processed = true;
      processed.add(elements[i]);
      if (result.is_toxic) {
        blurElement(elements[i]);
      }
    });

  } catch (err) {
    console.warn('[ToxicFilter] Could not reach API. Is your Flask server running?', err);
  }
}

// ── Run on page load ──────────────────────────────────────────────────────────
filterPage();

// ── Watch for dynamically loaded content ─────────────────────────────────────
// Many modern sites load content after the page is ready (e.g. Twitter, Reddit).
// We debounce so we don't fire 100 API calls for one big DOM update.
let debounceTimer = null;

const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    filterPage();
  }, 500);
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

console.log('[ToxicFilter] Extension active.');