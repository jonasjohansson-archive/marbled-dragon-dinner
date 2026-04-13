import {
  API_URL,
  GROUP_SLUG,
  ROUND_SLUG,
  DEFAULT_LIMIT,
  STATUS_FILTER,
} from "./config.js";

export async function fetchBuckets(offset, tag = "", limit = DEFAULT_LIMIT) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query Buckets($groupSlug: String, $roundSlug: String!, $tag: String, $offset: Int, $limit: Int, $status: [StatusType!]) {
          bucketsPage(groupSlug: $groupSlug, roundSlug: $roundSlug, offset: $offset, limit: $limit, tag: $tag, status: $status) {
            moreExist
            buckets {
              id title summary status noOfFunders noOfComments percentageFunded minGoal maxGoal income
              images { small } customFields { value customField { name } }
              tags { value }
            }
          }
        }
      `,
      variables: {
        groupSlug: GROUP_SLUG,
        roundSlug: ROUND_SLUG,
        offset,
        tag,
        limit,
        status: STATUS_FILTER,
      },
    }),
  });

  const { data } = await response.json();
  return data?.bucketsPage || { buckets: [], moreExist: false };
}
