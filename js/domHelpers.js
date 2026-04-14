export function setLoadingMessage(msg) {
  const loadingEl = document.querySelector(".loading");
  if (loadingEl) loadingEl.textContent = msg;
}

export function hideLoading() {
  const loadingEl = document.querySelector(".loading");
  if (loadingEl) loadingEl.classList.add("hidden");
}

// Simple Fisher-Yates shuffle
export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function removeEmojis(str = "") {
  return str.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF]|\uFE0F|\u200D)+/g,
    ""
  );
}

let markedParse = null;

export async function initMarkdown() {
  const { marked } = await import("https://cdn.jsdelivr.net/npm/marked@15/lib/marked.esm.js");
  marked.use({
    renderer: {
      // Open links in new tab, only allow http(s)
      link({ href, text }) {
        if (!/^https?:\/\//.test(href)) return text;
        return `<a href="${href}" target="_blank">${text}</a>`;
      },
      // Keep images intact
      image({ href, text }) {
        return `<img src="${href}" alt="${escapeHtml(text || "")}" loading="lazy" />`;
      },
    },
  });
  markedParse = (md) => marked.parse(md);
}

export function cleanCustomFieldValue(value) {
  if (markedParse) {
    // Strip bold wrapping if the entire value is wrapped in **...**
    value = value.replace(/^\*\*([\s\S]*)\*\*$/gm, "$1");
    // Remove [Image #N] placeholders
    value = value.replace(/\[Image #\d+\]/gi, "");
    return markedParse(value);
  }

  // Fallback if marked hasn't loaded yet
  value = escapeHtml(value);
  value = value.replace(/^\*\*([\s\S]*)\*\*$/gm, "$1");
  value = value
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/\r\n|\r|\n/gim, "<br>")
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/__(.*?)__/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<i>$1</i>")
    .replace(/\b_(.*?)_\b/gim, "<i>$1</i>")
    .replace(/\[([^\[]+)\]\(((https?:\/\/)[^)]*)\)/gim, (_, text, url) =>
      `<a href="${url.replace(/&amp;/g, "&")}" target="_blank">${text}</a>`)
    .replace(/\[Image #\d+\]/gi, "");
  return value;
}

export function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
