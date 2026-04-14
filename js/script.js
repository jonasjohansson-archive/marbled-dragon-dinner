import { fetchDreams } from "./fetchDreams.js";
import { handleSearch } from "./handleSearch.js";
import { initRatingFilter } from "./rating.js";
import { sortBuckets } from "./sortBuckets.js";
import { initTagFilter } from "./tagFilter.js";
import { initDetailPanel } from "./detailPanel.js";
import { initMarkdown } from "./domHelpers.js";

document.getElementById("search-bar").addEventListener("input", handleSearch);
document.getElementById("sort-buckets").addEventListener("change", sortBuckets);

document.querySelector("h1 a").addEventListener("click", (e) => {
  e.preventDefault();
  history.replaceState(null, "", location.pathname);
  document.querySelectorAll(".bucket.selected").forEach((el) => el.classList.remove("selected"));
  const panel = document.getElementById("detail-panel");
  panel.innerHTML = "";
  panel.classList.remove("active");
});
initRatingFilter();
initMarkdown();
fetchDreams().then(() => {
  initTagFilter();
  initDetailPanel();
});
