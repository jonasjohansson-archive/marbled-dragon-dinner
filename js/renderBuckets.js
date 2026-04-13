import { removeEmojis, escapeHtml } from "./domHelpers.js";
import { Rating } from "./rating.js";

// Use Cloudinary auto-format/quality and resize for card thumbnails
function thumbUrl(url) {
  if (!url) return "";
  return url.replace("/upload/", "/upload/f_auto,q_auto,w_400,c_fill/");
}

let renderedCount = 0;

export function renderBuckets(bucketsToRender) {
  const list = document.getElementById("buckets-list");
  const fragment = document.createDocumentFragment();
  const rating = new Rating();

  bucketsToRender.forEach((bucket) => {
    const { id: bucketId, title, noOfComments, minGoal, maxGoal, images } = bucket;
    const tags = (bucket.tags || []).map((t) => t.value);
    const ratingValue = rating.get(bucketId);
    const cleanTitle = escapeHtml(removeEmojis(title || ""));
    const coverImage = thumbUrl(images?.[0]?.small || "");
    // First 20 cards are eager (above the fold), rest are lazy
    const loading = renderedCount < 20 ? "eager" : "lazy";
    renderedCount++;

    const div = document.createElement("div");
    div.className = "bucket";
    div.dataset.rating = ratingValue;
    div.dataset.bucketId = bucketId;
    div.dataset.tags = tags.join(",");

    div.innerHTML = `
      ${coverImage ? `<img class="bucket-cover" src="${coverImage}" alt="${cleanTitle}" loading="${loading}" width="400" height="100" />` : ""}
      <div class="bucket-row">
        <div class="bucket-row-top">
          <h2>${cleanTitle}</h2>
          <sl-rating class="rating" label="Rating" max="3" value="${ratingValue}"></sl-rating>
        </div>
        <div class="bucket-meta-row">
          <span class="bucket-meta">${minGoal}–${maxGoal}</span>
          <span class="bucket-meta">💬${noOfComments}</span>
        </div>
      </div>
    `;

    div.querySelector(".rating").addEventListener("sl-change", (e) => {
      const newRating = e.target.value;
      rating.set(newRating, bucketId);
      div.dataset.rating = newRating;
    });

    fragment.appendChild(div);
  });

  list.appendChild(fragment);
}
