import { SECTION_COPY, STACK_ROWS } from "../data/content";
import { StackIcon } from "./StackIcon";
import { Section } from "./ui";

/**
 * `board` composition: the five tool categories set as display type, with their
 * tools as a small run beneath and a count in tabular figures. The scale
 * contrast between the two is the whole device — a 14px label over 15px items
 * is what made the previous version read as an unstyled form.
 */
export function Skills() {
  return (
    <Section id="technologies" title={SECTION_COPY.stack.title}>
      <div className="kit">
        {STACK_ROWS.map((row) => (
          <div className="kit-group" key={row.label}>
            <div className="kit-head">
              <h3 className="kit-name">{row.label}</h3>
              {/* Derived from the list below it, so it is presentational. */}
              <span className="kit-count num" aria-hidden="true">
                {row.items.length}
              </span>
            </div>
            <ul className="kit-list">
              {row.items.map((item) => (
                <li key={item}>
                  <StackIcon label={item} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
