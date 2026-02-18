const API_URL = 'https://localhost:5000/';

// ── Check if Flask API is reachable and update the status indicator ───────────
async function checkAPIStatus() {
  const dot = document.getElementById('status-dot');
  const text = document.getElementById('status-text');

  try {
    const response = await fetch(API_URL);
    if (response.ok) {
      // Green — API is running
      dot.style.background = '#4ade80';
      dot.style.boxShadow = '0 0 10px #4ade80';
      text.textContent = 'API connected — Filter active';
    } else {
      throw new Error();
    }
  } catch {
    // Red — can't reach Flask
    dot.style.background = '#f87171';
    dot.style.boxShadow = '0 0 10px #f87171';
    text.textContent = 'API offline — Run python app.py';
  }
}

// ── Reload button ─────────────────────────────────────────────────────────────
document.getElementById('reload-btn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.reload(tabs[0].id);
      window.close();
    }
  });
});

// Run status check as soon as popup opens
checkAPIStatus();