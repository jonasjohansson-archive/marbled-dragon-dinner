import { allBuckets } from "./state.js";
import { renderBuckets } from "./renderBuckets.js";
import { Rating } from "./rating.js";
import { shuffleArray } from "./domHelpers.js";

export function sortBuckets(event) {
  const rating = new Rating();
  const visibleBuckets = document.querySelectorAll(".bucket:not(.hidden)");
  const visibleIds = new Set(
    Array.from(visibleBuckets).map((el) => el.dataset.bucketId)
  );
  let bucketList = allBuckets.filter((bucket) => visibleIds.has(bucket.id));

  switch (event.target.value) {
    case "name-asc":
      bucketList.sort(compareStringsAscOrder);
      break;
    case "name-desc":
      bucketList.sort(compareStringsAscOrder).reverse();
      break;
    case "fund-percent-asc":
      bucketList.sort(compareFundPercentAscOrder);
      break;
    case "fund-percent-desc":
      bucketList.sort(compareFundPercentAscOrder).reverse();
      break;
    case "fund-asc":
      bucketList.sort(compareFundAscOrder);
      break;
    case "fund-desc":
      bucketList.sort(compareFundAscOrder).reverse();
      break;
    case "funders-asc":
      bucketList.sort(compareFundersAscOrder);
      break;
    case "funders-desc":
      bucketList.sort(compareFundersAscOrder).reverse();
      break;
    case "comments-asc":
      bucketList.sort(compareCommentsAscOrder);
      break;
    case "comments-desc":
      bucketList.sort(compareCommentsAscOrder).reverse();
      break;
    case "budget-min-asc":
      bucketList.sort(compareBudgetMinAscOrder);
      break;
    case "budget-min-desc":
      bucketList.sort(compareBudgetMinAscOrder).reverse();
      break;
    case "requested-asc":
      bucketList.sort(compareRequestedAscOrder);
      break;
    case "requested-desc":
      bucketList.sort(compareRequestedAscOrder).reverse();
      break;
    case "selffunded-asc":
      bucketList.sort(compareSelfFundedAscOrder);
      break;
    case "selffunded-desc":
      bucketList.sort(compareSelfFundedAscOrder).reverse();
      break;
    case "rating-asc":
      sortByRating(bucketList, rating.getAllRatings(), true);
      break;
    case "rating-desc":
      sortByRating(bucketList, rating.getAllRatings());
      break;
    default: // Random
      shuffleArray(bucketList);
      break;
  }
  const list = document.getElementById("buckets-list");
  list.innerHTML = "";
  renderBuckets(bucketList);
}

let compareStringsAscOrder = function (a, b) {
  if (a.title < b.title) {
    return -1;
  }
  if (a.title > b.title) {
    return 1;
  }
  return 0;
};
let compareFundPercentAscOrder = function (a, b) {
  return a.percentageFundedTrue - b.percentageFundedTrue;
};
let compareFundAscOrder = function (a, b) {
  return a.percentageFunded * a.minGoal - b.percentageFunded * b.minGoal;
};
let compareFundersAscOrder = function (a, b) {
  return a.noOfFunders - b.noOfFunders;
};
let compareCommentsAscOrder = function (a, b) {
  return a.noOfComments - b.noOfComments;
};
let compareBudgetMinAscOrder = function (a, b) {
  return (a.minGoal + a.income) - (b.minGoal + b.income);
};
let compareBudgetMaxAscOrder = function (a, b) {
  return a.maxGoal - b.maxGoal;
};
let compareRequestedAscOrder = function (a, b) {
  return a.minGoal - b.minGoal;
};
let compareSelfFundedAscOrder = function (a, b) {
  return a.income - b.income;
};
function moveToStart(arr, from) {
  if (from < 0) return;
  const item = arr.splice(from, 1)[0];
  arr.unshift(item);
}

let sortByRating = function (allDreams, ratings, ascOrder = false) {
  // Loop through the ratings 1-3 and add them to the start of the array

  let findDreamsAndMove = function (allDreams, currentRatingValue) {
    let dreams = ratings.filter((r) => r.rating === currentRatingValue);
    for (let i = 0; i < dreams.length; i++) {
      moveToStart(
        allDreams,
        allDreams.findIndex((d) => d.id === dreams[i].bucketId)
      );
    }
  };

  if (ascOrder) {
    for (
      let currentRatingValue = 3;
      currentRatingValue > 0;
      currentRatingValue--
    ) {
      findDreamsAndMove(allDreams, currentRatingValue);
    }
  } else {
    for (
      let currentRatingValue = 1;
      currentRatingValue < 4;
      currentRatingValue++
    ) {
      findDreamsAndMove(allDreams, currentRatingValue);
    }
  }
};
