import { allBuckets } from "./state.js";

export function initTagFilter() {
  const select = document.getElementById("tag-filter");
  if (!select) return;

  // Collect all tags with counts, sorted by frequency
  const tagCounts = {};
  allBuckets.forEach((b) => {
    (b.tags || []).forEach((t) => {
      tagCounts[t.value] = (tagCounts[t.value] || 0) + 1;
    });
  });

  const sorted = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  sorted.forEach(([tag, count]) => {
    const option = document.createElement("sl-option");
    option.value = tag;
    option.textContent = `${tag} (${count})`;
    select.appendChild(option);
  });

  select.addEventListener("sl-change", () => {
    const selectedTag = select.value;
    const buckets = document.querySelectorAll(".bucket");

    buckets.forEach((bucket) => {
      const tags = bucket.dataset.tags || "";
      if (!selectedTag || tags.split(",").includes(selectedTag)) {
        bucket.classList.remove("tag-hidden");
      } else {
        bucket.classList.add("tag-hidden");
      }
    });
  });
}
