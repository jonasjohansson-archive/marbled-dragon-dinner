import { allBuckets } from "./state.js";

// Build a search index from the full bucket data (title, summary, custom fields, tags)
function getSearchText(bucket) {
  const parts = [
    bucket.title || "",
    bucket.summary || "",
    ...(bucket.customFields || []).map((f) => f.value || ""),
    ...(bucket.tags || []).map((t) => t.value || ""),
  ];
  return parts.join(" ").toLowerCase();
}

let searchIndex = null;

function ensureIndex() {
  if (searchIndex) return;
  searchIndex = new Map();
  allBuckets.forEach((b) => searchIndex.set(b.id, getSearchText(b)));
}

export function handleSearch(event) {
  ensureIndex();
  const query = (
    event?.target?.value || document.getElementById("search-bar").value
  ).toLowerCase();
  const buckets = document.querySelectorAll(".bucket");

  buckets.forEach((bucket) => {
    const text = searchIndex.get(bucket.dataset.bucketId) || "";
    if (text.includes(query)) {
      bucket.classList.remove("hidden");
    } else {
      bucket.classList.add("hidden");
    }
  });
}
