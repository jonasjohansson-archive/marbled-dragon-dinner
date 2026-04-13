// import { handleSearch } from "./handleSearch.js";
import { removeEmojis, cleanCustomFieldValue, escapeHtml } from "./domHelpers.js";
import { Rating } from "./rating.js";
import { DREAMS_URL } from "./config.js";

export function renderBuckets(bucketsToRender) {
  const list = document.getElementById("buckets-list");
  const urlBase = DREAMS_URL;
  const fragment = document.createDocumentFragment();
  const rating = new Rating();

  bucketsToRender.forEach((bucket, index) => {
    const {
      id: bucketId,
      title,
      summary,
      status,
      noOfFunders,
      noOfComments,
      percentageFunded,
      percentageFundedTrue,
      funded,
      income,
      minGoal,
      maxGoal,
      images,
      customFields,
    } = bucket;

    const isFundable = status !== "IDEA" && status !== "PENDING_APPROVAL";

    const ratingValue = rating.get(bucketId);

    const tags = (bucket.tags || []).map(t => t.value);

    const div = document.createElement("div");
    div.className = "bucket";
    div.dataset.rating = ratingValue;
    div.dataset.bucketId = bucketId;
    div.dataset.tags = tags.join(",");

    const customFieldsHTML = customFields
      .filter(
        ({ customField }) => customField?.name?.toLowerCase() === "description"
      )
      .map(
        ({ customField, value }) =>
          `<p><strong>${
            customField?.name || "Unnamed Field"
          }:</strong> ${cleanCustomFieldValue(value)}</p>`
      )
      .join("");

    const coverImage = images?.[0]?.small || "";
    const imagesHTML =
      images.length > 1
        ? images
            .slice(1)
            .map(
              (img) =>
                `<img loading="lazy" src="${img.small}" alt="${title} image" />`
            )
            .join("")
        : "";

    const cleanTitle = escapeHtml(removeEmojis(title || ""));
    const cleanSummary = escapeHtml(removeEmojis(summary || ""));

    div.innerHTML = `
      <header>
          <div class="title-row">
          <sl-tooltip content="${cleanTitle}">
            <h2><a href="${urlBase}/${bucketId}" target="_blank">${cleanTitle}</a></h2>
          </sl-tooltip>
            <sl-rating class="rating" label="Rating" value="${ratingValue}"></sl-rating>
          </div>
          <div class="info-row">
            ${isFundable ? `
            <div class="goals">
              <span><strong>Goal:</strong> ${minGoal}–${maxGoal}</span>
            </div>
            <div class="progress-bar-container">
              <sl-progress-bar value="${
                percentageFundedTrue > 100 ? 100 : percentageFundedTrue
              }">
                <span>${percentageFundedTrue}%</span>
              </sl-progress-bar>
            </div>
            <p class="funders-comments">
              <span class="icon funder-icon">💰</span>
              <span>${noOfFunders}</span>
            </p>
            ` : `
            <div class="goals">
              <span><strong>Goal:</strong> ${minGoal}–${maxGoal}</span>
            </div>
            <sl-badge variant="neutral">${status.replace(/_/g, ' ').toLowerCase()}</sl-badge>
            `}
            <sl-tooltip content="View comments">
              <a href="${urlBase}/${bucketId}?tab=comments" class="comment-link">
                <span class="icon comment-icon">💬</span>
                <span>${noOfComments}</span>
              </a>
            </sl-tooltip>
          </div>
          ${tags.length ? `<div class="tags">${tags.map(t => `<sl-badge variant="primary" pill>${escapeHtml(t)}</sl-badge>`).join(" ")}</div>` : ""}
      </header>
      <main>
        ${coverImage ? `<img class="cover" src="${coverImage}" alt="${cleanTitle}">` : ''}
        <details>
          <summary>
            ${cleanSummary || "N/A"}
          </summary>
          <br>
          <div class="custom-fields">
            ${customFieldsHTML || "<p>No custom fields found.</p>"}
          </div>
          <br>
          ${imagesHTML}
        </details>
      </main>
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
