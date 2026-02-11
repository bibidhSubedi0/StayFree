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