// Function to censor text nodes
function censorText(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const originalText = node.textContent;
    const censoredText = originalText.replace(/\bthe\b/gi, '***');
    
    if (originalText !== censoredText) {
      node.textContent = censoredText;
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && node.tagName !== 'INPUT' && node.tagName !== 'TEXTAREA') {
      for (let child of node.childNodes) {
        censorText(child);
      }
    }
  }
}

censorText(document.body);

// Observe dom changes to censor dynamically loaded content
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
        censorText(node);
      }
    });
  });
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});

console.log('Word Censor extension is active!');