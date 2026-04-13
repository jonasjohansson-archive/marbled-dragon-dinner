import { fetchDreams } from "./fetchDreams.js";
import { handleSearch } from "./handleSearch.js";
import { initRatingFilter } from "./rating.js";
import { sortBuckets } from "./sortBuckets.js";
import { initTagFilter } from "./tagFilter.js";

document.getElementById("search-bar").addEventListener("sl-input", handleSearch);
document.getElementById("sort-buckets").addEventListener("sl-change", sortBuckets);
initRatingFilter();
fetchDreams().then(initTagFilter);
