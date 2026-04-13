import { allBuckets } from "./state.js";
import { cleanCustomFieldValue, escapeHtml, removeEmojis } from "./domHelpers.js";
import { DREAMS_URL } from "./config.js";
import { Rating } from "./rating.js";

const rating = new Rating();

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function starHTML(value, max = 3) {
  let html = '<span class="star-rating">';
  for (let i = 1; i <= max; i++) {
    html += `<button data-value="${i}" class="${i <= value ? "filled" : ""}">&#9733;</button>`;
  }
  html += "</span>";
  return html;
}

function formatSEK(value) {
  return value.toLocaleString("sv-SE");
}

function buildBudgetItemsHTML(items) {
  if (!items.length) return "";

  const income = items.filter((i) => i.type === "INCOME");
  const expenses = items.filter((i) => i.type === "EXPENSE");

  const rowHTML = (item) => {
    const amount =
      item.max != null
        ? `${formatSEK(item.min)}&ndash;${formatSEK(item.max)}`
        : formatSEK(item.min);
    return `<tr><td>${escapeHtml(item.description)}</td><td>${amount}</td></tr>`;
  };

  let html = '<div class="budget-items">';

  if (income.length) {
    html += `<table><thead><tr><th colspan="2">Income</th></tr></thead><tbody>${income.map(rowHTML).join("")}</tbody></table>`;
  }
  if (expenses.length) {
    html += `<table><thead><tr><th colspan="2">Expenses</th></tr></thead><tbody>${expenses.map(rowHTML).join("")}</tbody></table>`;
  }

  html += "</div>";
  return html;
}

export function initDetailPanel() {
  document.getElementById("buckets-list").addEventListener("click", (e) => {
    if (e.target.closest(".star-rating")) return;
    const bucketEl = e.target.closest(".bucket");
    if (!bucketEl) return;

    const bucketId = bucketEl.dataset.bucketId;
    const bucket = allBuckets.find((b) => b.id === bucketId);
    if (!bucket) return;

    selectDream(bucket, bucketEl);
  });

  // Open dream from URL hash on load
  openFromHash();
  window.addEventListener("hashchange", openFromHash);
}

function openFromHash() {
  const hash = decodeURIComponent(location.hash.slice(1));
  if (!hash) return;

  // Match by id or slug
  const bucket = allBuckets.find(
    (b) => b.id === hash || slugify(removeEmojis(b.title || "")) === hash
  );
  if (!bucket) return;

  const bucketEl = document.querySelector(`.bucket[data-bucket-id="${bucket.id}"]`);
  selectDream(bucket, bucketEl);
  if (bucketEl) bucketEl.scrollIntoView({ block: "nearest" });
}

function selectDream(bucket, bucketEl) {
  document.querySelectorAll(".bucket.selected").forEach((el) => el.classList.remove("selected"));
  if (bucketEl) bucketEl.classList.add("selected");

  // Update URL hash with slug
  const slug = slugify(removeEmojis(bucket.title || ""));
  history.replaceState(null, "", "#" + slug);

  renderDetail(bucket);
}

function getField(bucket, name) {
  const f = bucket.customFields.find(
    ({ customField }) => customField?.name?.toLowerCase() === name.toLowerCase()
  );
  return f?.value?.trim() || "";
}

function renderDetail(bucket) {
  const panel = document.getElementById("detail-panel");
  const tags = (bucket.tags || []).map((t) => t.value);
  const cleanTitle = escapeHtml(removeEmojis(bucket.title || ""));
  const ratingValue = rating.get(bucket.id);
  const statusLabel = (bucket.status || "").replace(/_/g, " ").toLowerCase();

  const imagesHTML = (bucket.images || [])
    .map((img) => `<img src="${img.small}" alt="${cleanTitle}" loading="lazy" />`)
    .join("");

  const budgetItemsHTML = buildBudgetItemsHTML(bucket.budgetItems || []);

  // Funding info
  const fundingHTML = `
    <div class="detail-funding">
      <strong>${formatSEK(bucket.income)} kr</strong> funded of ${formatSEK(bucket.minGoal)} kr goal
    </div>
  `;

  // Status + tags
  const tagsHTML = tags.length
    ? `<div class="detail-tags">${tags.map((t) => `<span>${escapeHtml(t)}</span>`).join("")}</div>`
    : "";

  // Camp
  const camp = getField(bucket, "This dream belongs to camp:");
  const campHTML = camp
    ? `<div class="detail-field"><div class="detail-field-name">Camp</div><div class="detail-field-value">${escapeHtml(camp)}</div></div>`
    : "";

  // All custom fields in order, excluding camp (shown separately above)
  const excludeFields = ["this dream belongs to camp:"];
  const fieldsHTML = bucket.customFields
    .filter(({ customField, value }) =>
      value?.trim() && !excludeFields.includes(customField?.name?.toLowerCase())
    )
    .map(
      ({ customField, value }) => `
      <div class="detail-field">
        <div class="detail-field-name">${escapeHtml(customField?.name || "Field")}</div>
        <div class="detail-field-value">${cleanCustomFieldValue(value)}</div>
      </div>
    `
    )
    .join("");

  panel.innerHTML = `
    <h2><a href="${DREAMS_URL}/${bucket.id}" target="_blank">${cleanTitle}</a></h2>
    ${fundingHTML}
    <div class="detail-meta">
      <span>${statusLabel}</span>
      <span>&#x1F4AC; ${bucket.noOfComments}</span>
      ${starHTML(ratingValue)}
    </div>
    ${tagsHTML}
    ${campHTML}
    ${imagesHTML ? `<div class="detail-images">${imagesHTML}</div>` : ""}
    ${fieldsHTML}
    ${budgetItemsHTML}
  `;

  panel.querySelector(".star-rating").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    let newRating = parseInt(btn.dataset.value);
    const currentRating = rating.get(bucket.id);
    if (newRating === currentRating) newRating = 0;
    rating.set(newRating, bucket.id);

    panel.querySelectorAll(".star-rating button").forEach((b, i) => {
      b.classList.toggle("filled", i < newRating);
    });

    const listItem = document.querySelector(`.bucket[data-bucket-id="${bucket.id}"]`);
    if (listItem) {
      listItem.dataset.rating = newRating;
      listItem.querySelectorAll(".star-rating button").forEach((b, i) => {
        b.classList.toggle("filled", i < newRating);
      });
    }
  });
}
