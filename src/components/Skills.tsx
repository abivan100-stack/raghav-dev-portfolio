import { SECTION_COPY, STACK_ROWS } from "../data/content";
import { Section } from "./ui";

export function Skills() {
  return (
    <Section id="technologies" title={SECTION_COPY.stack.title}>
      <dl className="drawers">
        {STACK_ROWS.map((row) => (
          <div className="drawer" key={row.label}>
            <dt>{row.label}</dt>
            <dd>
              <ul className="bins">
                {row.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
