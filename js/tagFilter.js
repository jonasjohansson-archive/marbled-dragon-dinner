import { allBuckets } from "./state.js";
import { escapeHtml } from "./domHelpers.js";

const activeTags = new Set();

export function initTagFilter() {
  const container = document.getElementById("tag-filter");
  if (!container) return;

  const tagCounts = {};
  allBuckets.forEach((b) => {
    (b.tags || []).forEach((t) => {
      tagCounts[t.value] = (tagCounts[t.value] || 0) + 1;
    });
  });

  const sorted = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  sorted.forEach(([tag, count]) => {
    const pill = document.createElement("button");
    pill.className = "tag-pill";
    pill.dataset.tag = tag;
    pill.innerHTML = `${escapeHtml(tag)} <span class="tag-count">${count}</span>`;
    pill.addEventListener("click", () => {
      if (activeTags.has(tag)) {
        activeTags.delete(tag);
        pill.classList.remove("active");
      } else {
        activeTags.add(tag);
        pill.classList.add("active");
      }
      applyTagFilter();
    });
    container.appendChild(pill);
  });
}

function applyTagFilter() {
  const buckets = document.querySelectorAll(".bucket");

  if (activeTags.size === 0) {
    buckets.forEach((b) => b.classList.remove("tag-hidden"));
    return;
  }

  buckets.forEach((bucket) => {
    const tags = (bucket.dataset.tags || "").split(",").filter(Boolean);
    const matches = tags.some((t) => activeTags.has(t));
    bucket.classList.toggle("tag-hidden", !matches);
  });
}
