// Shared contributions data access (used by the Contributions section
// and the hero teaser). One memoized request per page load: every consumer
// gets the same cached promise, so the endpoint is hit exactly once.
// Unavailable/invalid data resolves to null (consumers hide themselves);
// this function never rejects.

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export interface ContributionDay {
  date: string;
  count: number;
  level: ContributionLevel;
}

export interface ContributionCalendar {
  available: true;
  totalContributions: number;
  weeks: ContributionDay[][];
}

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

function isContributionLevel(value: unknown): value is ContributionLevel {
  return value === 0 || value === 1 || value === 2 || value === 3 || value === 4;
}

function isContributionCalendar(value: unknown): value is ContributionCalendar {
  if (typeof value !== "object" || value === null) return false;
  const calendar = value as Record<string, unknown>;
  if (
    typeof calendar.totalContributions !== "number" ||
    !Number.isInteger(calendar.totalContributions) ||
    calendar.totalContributions < 0 ||
    !Array.isArray(calendar.weeks)
  ) {
    return false;
  }

  return calendar.available === true && calendar.weeks.every(
    (week: unknown) =>
      Array.isArray(week) &&
      week.every((day: unknown) => {
        if (typeof day !== "object" || day === null) return false;
        const { date, count, level } = day as Record<string, unknown>;
        return (
          // A malformed date would make Intl.DateTimeFormat throw mid-render.
          typeof date === "string" &&
          ISO_DAY.test(date) &&
          Number.isInteger(count) &&
          (count as number) >= 0 &&
          isContributionLevel(level)
        );
      }),
  );
}

async function loadCalendar(): Promise<ContributionCalendar | null> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch("/api/github-contributions", {
      signal: controller.signal,
    });
    if (!response.ok) return null;

    const payload: unknown = await response.json();
    if (
      typeof payload === "object" &&
      payload !== null &&
      "available" in payload &&
      payload.available === false
    ) {
      return null;
    }
    if (!isContributionCalendar(payload)) return null;
    return payload;
  } catch {
    // Keep consumers hidden when the data source is unavailable.
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

let cached: Promise<ContributionCalendar | null> | null = null;

/** Shared, memoized contribution calendar request. Never rejects. */
export function getContributions(): Promise<ContributionCalendar | null> {
  cached ??= loadCalendar();
  return cached;
}
