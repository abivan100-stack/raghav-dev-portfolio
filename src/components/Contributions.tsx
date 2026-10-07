import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SECTION_COPY } from "../data/content";
import type { ContributionCalendar } from "../lib/contributions";
import { getContributions } from "../lib/contributions";
import { useMediaQuery } from "../lib/useMediaQuery";
import { Section } from "./ui";

// Built once: a formatter per render per cell (~370 cells) is wasted work.
const DAY_FORMAT = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});
const MONTH_FORMAT = new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" });
const WEEKDAY_LABELS = [
  { weekday: 1, label: "Mon" },
  { weekday: 3, label: "Wed" },
  { weekday: 5, label: "Fri" },
];

const CELL = 10;
const GAP = 2;
const STEP = CELL + GAP;
const LABEL_WIDTH = 24;
const LABEL_HEIGHT = 16;

function utcDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

export function Contributions() {
  const copy = SECTION_COPY.contributions;
  const [calendar, setCalendar] = useState<ContributionCalendar | null>(null);
  const compact = useMediaQuery("(max-width: 640px)");
  // The chart only becomes a scroll region when it genuinely overflows, so the
  // focusable region and its label never lie about the layout.
  const [overflows, setOverflows] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    void getContributions().then((result) => {
      if (active) setCalendar(result);
    });
    return () => {
      active = false;
    };
  }, []);

  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    const measure = () => setOverflows(node.scrollWidth - node.clientWidth > 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [calendar, compact]);

  // The section mounts after its fetch, too late for the shell's initial hash scroll.
  useEffect(() => {
    if (calendar && window.location.hash === "#contributions") {
      document.getElementById("contributions")?.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, [calendar]);

  if (!calendar) return null;

  // Small screens show the most recent ~6 months so the cells stay legible;
  // larger screens show the full year. The chart keeps its natural width and
  // scrolls inside its own region rather than shrinking below its viewBox.
  const visibleWeeks = compact ? calendar.weeks.slice(-26) : calendar.weeks;
  const rangeLabel = compact ? "recent months" : "the past year";
  // The compact chart shows only the recent slice, so its caption reports that
  // slice's total: the year total would describe a range the reader can't see.
  const visibleTotal = compact
    ? visibleWeeks.flat().reduce((sum, day) => sum + day.count, 0)
    : calendar.totalContributions;
  const total = visibleTotal.toLocaleString();

  const chartWidth = LABEL_WIDTH + Math.max(visibleWeeks.length * STEP - GAP, 1);
  const chartHeight = LABEL_HEIGHT + 7 * STEP - GAP;
  // A label needs about three week columns; one starting later would be clipped.
  const lastLabelWeek = visibleWeeks.length - 3;
  const monthLabels = visibleWeeks.flatMap((week, weekIndex) => {
    const firstOfMonth = week.find((day) => utcDate(day.date).getUTCDate() === 1);
    return firstOfMonth && weekIndex <= lastLabelWeek
      ? [{ weekIndex, label: MONTH_FORMAT.format(utcDate(firstOfMonth.date)) }]
      : [];
  });

  return (
    <Section id="contributions" title={copy.title}>
      <p className="contribution-summary">
        <span className="contribution-total">{total}</span> public contributions in {rangeLabel}.
      </p>
      <figure className="contribution-figure">
        <div
          ref={scrollRef}
          className="contribution-chart-scroll"
          role={overflows ? "region" : undefined}
          aria-label={overflows ? "Public contribution calendar" : undefined}
          tabIndex={overflows ? 0 : undefined}
        >
          <svg
            className="contribution-chart"
            style={{ width: chartWidth }}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            role="img"
            aria-label={`GitHub public contribution calendar for ${rangeLabel}: ${total} contributions. Darker squares mean more contributions that day.`}
          >
            {monthLabels.map((month) => (
              <text
                key={`${month.label}-${month.weekIndex}`}
                className="contribution-axis-label"
                aria-hidden="true"
                x={LABEL_WIDTH + month.weekIndex * STEP}
                y="10"
              >
                {month.label}
              </text>
            ))}
            {WEEKDAY_LABELS.map(({ weekday, label }) => (
              <text
                key={weekday}
                className="contribution-axis-label"
                aria-hidden="true"
                x="0"
                y={LABEL_HEIGHT + weekday * STEP + CELL - 1}
              >
                {label}
              </text>
            ))}
            {visibleWeeks.flatMap((week, weekIndex) =>
              week.map((day) => {
                const date = utcDate(day.date);
                return (
                  <rect
                    key={day.date}
                    className={`contribution-cell contribution-level-${day.level}`}
                    x={LABEL_WIDTH + weekIndex * STEP}
                    y={LABEL_HEIGHT + date.getUTCDay() * STEP}
                    width={CELL}
                    height={CELL}
                    rx="2"
                  >
                    {/* Names the day for hover and for screen readers (each cell is a graphic). */}
                    <title>
                      {day.count} public contributions on {DAY_FORMAT.format(date)}
                    </title>
                  </rect>
                );
              }),
            )}
          </svg>
        </div>
        <figcaption className="contribution-legend-caption">
          <ul className="contribution-legend">
            <li className="contribution-legend-cap">{copy.less}</li>
            {[0, 1, 2, 3, 4].map((level) => (
              <li key={level} aria-hidden="true">
                <span
                  className={`contribution-cell contribution-level-${level}`}
                  aria-hidden="true"
                />
              </li>
            ))}
            <li className="contribution-legend-cap">{copy.more}</li>
          </ul>
        </figcaption>
      </figure>
    </Section>
  );
}
